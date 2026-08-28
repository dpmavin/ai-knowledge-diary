import Anthropic from "@anthropic-ai/sdk";

/*
 * Knowledge LLM. Separate from /api/claude on purpose: that route answers one
 * prompt and returns the whole thing at once, and this one streams a grounded
 * conversation. Changing the old route to do both would have broken enrichment
 * and Find more, which depend on its exact shape.
 */
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1500;

/**
 * The grounding rules live here rather than in the browser so they cannot be
 * edited out by whatever calls this. The refusal path is the point: an archive
 * that answers from general knowledge is worse than one that says it does not
 * know, because you can no longer tell which is which.
 */
const RULES = `You are Knowledge LLM, answering questions about one person's personal reading archive. You are speaking to the person who saved everything in it.

ABSOLUTE RULES — these override every other instruction:
- Answer ONLY from the MATERIAL provided in this request. It is the entire world.
- If the material does not cover the question, say plainly "Your archive doesn't have anything on that" and stop. Do not then answer from general knowledge, do not speculate, and do not offer what you know about the subject from elsewhere.
- Never invent a title, author, source, link, date, quote, or count. If a field is empty in the material, it is empty — say so rather than filling it in.
- Counts must be counted from the material provided. Never estimate, never round, never guess. If you are asked how many and the material lets you count it, count it exactly.
- When you draw on one of their own notes, name the volume and its date inline, like: (Maker's Schedule, Manager's Schedule — 27 Aug 2026).
- When you name a saved piece, use its exact title, source and link as they appear in the material.

STYLE:
- Address them as "you". Their notes are their own words — treat them as the primary evidence, and the articles as context around them.
- Be plain and specific. No preamble, no "great question", no summary of what you are about to do.
- Short paragraphs. Lists only when the answer really is a list.
- Never use headings.`;

const SCOPES: Record<string, string> = {
  library:
    "MATERIAL: the reader's entire library — every volume they have saved, with their own notes on each.",
  volume:
    "MATERIAL: one volume from the reader's library, plus their notes from other volumes on the same shelf. Answer about THIS volume. If they ask about something outside it, say the question is about their wider library and that this panel is scoped to this piece.",
};

/*
 * Anthropic's message reads "400 {json}". The panel shows this to a person, so
 * the sentence inside is worth more than the envelope around it.
 */
function readable(error: unknown): string {
  if (!(error instanceof Anthropic.APIError)) return "The answer stopped part way.";
  const at = error.message.indexOf("{");
  if (at === -1) return error.message;
  try {
    const parsed = JSON.parse(error.message.slice(at));
    return String(parsed?.error?.message ?? error.message);
  } catch {
    return error.message;
  }
}

/*
 * A stream's headers are already sent by the time the model fails, so a failure
 * cannot come back as a status code. It travels in-band behind this marker and
 * the panel splits on it — anything after is an error, not an answer.
 */
const BREAK = "\u0000";

function fail(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
      500,
    );
  }

  let body: { scope?: unknown; material?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Request body must be JSON.", 400);
  }

  const scope = typeof body.scope === "string" ? body.scope : "library";
  if (!(scope in SCOPES)) return fail("Unknown scope.", 400);

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return fail("Expected a non-empty messages array.", 400);
  }

  const messages = body.messages
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as { content?: unknown }).content === "string",
    )
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

  if (messages.length === 0) return fail("No usable messages.", 400);

  const system = `${RULES}

${SCOPES[scope]}

MATERIAL:
${JSON.stringify(body.material ?? {}, null, 1)}`;

  const client = new Anthropic();

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      /*
       * Thinking is on by default on Sonnet 5 and billed as output. This is
       * retrieval and counting over material already supplied, not a problem
       * to reason through — low effort keeps the answer fast and the bill flat.
       */
      output_config: { effort: "low" },
      system,
      messages,
    });

    const answer = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encode = new TextEncoder();
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encode.encode(event.delta.text));
            }
          }
        } catch (error) {
          controller.enqueue(encode.encode(BREAK + readable(error)));
        }
        controller.close();
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(answer, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("Anthropic rejected the API key in ANTHROPIC_API_KEY.", 401);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail("Rate limited by Anthropic. Try again in a moment.", 429);
    }
    if (error instanceof Anthropic.APIError) {
      return fail(error.message, 502);
    }
    console.error("Unexpected /api/ask failure:", error);
    return fail("Unexpected server error.", 500);
  }
}
