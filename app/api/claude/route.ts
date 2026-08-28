import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1000;

/*
 * A search call spends its budget on tool turns before it writes anything, so
 * the same 1000 leaves the closing bracket off a four-result array. The answer
 * is JSON that has to parse — a truncated one is a total loss, not a short one.
 */
const SEARCH_MAX_TOKENS = 3000;

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
      500,
    );
  }

  let body: { prompt?: unknown; useWebSearch?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Request body must be JSON.", 400);
  }

  const { prompt, useWebSearch } = body;
  if (typeof prompt !== "string" || prompt.trim() === "") {
    return fail("Expected a non-empty { prompt } string.", 400);
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: useWebSearch === true ? SEARCH_MAX_TOKENS : MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
      ...(useWebSearch === true
        ? {
            tools: [
              { type: "web_search_20260209", name: "web_search", max_uses: 4 },
            ],
          }
        : {}),
    });

    // content is a discriminated union; text blocks carry the answer.
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    /**
     * Every URL web search actually returned. The caller filters the model's
     * JSON against this, so a hallucinated or reconstructed link cannot reach
     * the UI — the rule is enforced here, not just asked for in the prompt.
     */
    const sources: string[] = [];
    for (const block of response.content) {
      if (block.type !== "web_search_tool_result") continue;
      const results = block.content;
      if (!Array.isArray(results)) continue; // an error object, not results
      for (const result of results) {
        if (result.type === "web_search_result") sources.push(result.url);
      }
    }

    return Response.json({ text, sources });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("Anthropic rejected the API key in ANTHROPIC_API_KEY.", 401);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail("Rate limited by Anthropic. Try again in a moment.", 429);
    }
    if (error instanceof Anthropic.BadRequestError) {
      return fail(`Anthropic rejected the request: ${error.message}`, 400);
    }
    if (error instanceof Anthropic.APIConnectionError) {
      return fail("Could not reach the Anthropic API. Check your connection.", 503);
    }
    if (error instanceof Anthropic.APIError) {
      return fail(`Anthropic API error ${error.status}: ${error.message}`, 502);
    }
    console.error("Unexpected /api/claude failure:", error);
    return fail("Unexpected server error calling Claude.", 500);
  }
}
