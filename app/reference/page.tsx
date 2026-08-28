"use client";

import Link from "next/link";
import { coverStyle, FAMILIES, GRAIN_URL } from "@/lib/covers";
import type { CoverFamily } from "@/lib/types";

const FAMILY_NAMES = Object.keys(FAMILIES) as CoverFamily[];

function BigCover({
  family,
  status,
}: {
  family: CoverFamily;
  status: "unread" | "unannotated";
}) {
  return (
    <div
      className="relative h-[280px] w-[218px] overflow-hidden rounded-[14px]"
      style={{
        ...coverStyle(family),
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 0 1px rgba(10,10,10,0.10), inset 0 -28px 40px -24px rgba(10,10,10,0.35)",
      }}
    >
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: GRAIN_URL }}
      />
      <span
        className={
          status === "unread"
            ? "absolute right-4 top-4 h-[7px] w-[7px] rounded-[999px] bg-white"
            : "absolute right-4 top-4 h-[7px] w-[7px] rounded-[999px] border border-white/70"
        }
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-display text-[16px] leading-tight text-white">
          The Attention Economy Ate Design
        </p>
        <p className="mt-1 text-[12px] uppercase tracking-[0.08em] text-white/70">
          Substack
        </p>
      </div>
    </div>
  );
}

export default function Reference() {
  return (
    <div className="relative z-[1] mx-auto w-full max-w-[1100px] px-5 pb-24 pt-12 md:px-10">
      <Link href="/" className="meta text-warm">
        My library
      </Link>

      <h1 className="mt-4 font-display text-[38px] font-light leading-none">
        Cover reference
      </h1>

      <section className="mt-10">
        <h2 className="meta">Status markers</h2>
        <div className="mt-4 flex flex-wrap gap-10">
          <div>
            <BigCover family="ember" status="unread" />
            <p className="mt-4 max-w-[218px] text-[15px] leading-relaxed text-mute">
              <span className="text-ink">Solid dot — unread.</span> Saved from a
              recommendation and not opened yet. Clears by saving a fragment,
              never by a button.
            </p>
          </div>
          <div>
            <BigCover family="sage" status="unannotated" />
            <p className="mt-4 max-w-[218px] text-[15px] leading-relaxed text-mute">
              <span className="text-ink">Hollow ring — no thought.</span> Kept
              without saying why. Not a block and not a nag, just visible.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="meta">The five families</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {FAMILY_NAMES.map((family) => (
            <div key={family}>
              <div
                className="relative h-[120px] w-[120px] overflow-hidden rounded-[14px]"
                style={coverStyle(family)}
              >
                <div
                  className="absolute inset-0 mix-blend-overlay"
                  style={{ backgroundImage: GRAIN_URL }}
                />
              </div>
              <p className="meta mt-2">{family}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-mute">
                {FAMILIES[family].join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-mute">
          One family per shelf, so a topic reads as colour before you read the
          label. All the colour in the product lives here; the interface stays
          quiet.
        </p>
      </section>
    </div>
  );
}
