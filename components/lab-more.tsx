import Link from "next/link";

import { instruments } from "@/lib/lab";

/**
 * Exit path from an instrument.
 *
 * Lab pages are the ones strangers actually land on — from a link, or a search
 * for the mechanism they explain. Someone who finishes one and wants more
 * previously hit a dead end, which is where a visit ends regardless of how
 * good the page was. Reads from `lib/lab.ts`, so a new instrument appears at
 * the foot of every existing one automatically.
 */
export function MoreInstruments({ current }: { current: string }) {
  const rest = instruments.filter((instrument) => instrument.slug !== current);
  if (rest.length === 0) return null;

  return (
    <section aria-labelledby="more-instruments" className="border-t border-line bg-panel">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="mb-2 flex items-end justify-between gap-6 border-b border-line pb-4">
          <h2 id="more-instruments" className="label text-fg">
            {rest.length === 1 ? "Another instrument" : "Other instruments"}
          </h2>
          <Link
            href="/lab"
            className="shrink-0 font-mono text-xs tracking-wider text-muted uppercase transition-colors hover:text-signal"
          >
            All of them →
          </Link>
        </div>

        <ul>
          {rest.map((instrument) => (
            <li key={instrument.slug}>
              <Link
                href={`/lab/${instrument.slug}`}
                className="group grid gap-3 border-b border-line py-7 transition-colors hover:bg-panel-hi sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-signal">
                    {instrument.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
                    {instrument.summary}
                  </p>
                  <p className="label mt-3">{instrument.answers}</p>
                </div>
                <span
                  className="font-mono text-xs tracking-wider text-muted uppercase transition-colors group-hover:text-signal"
                  aria-hidden
                >
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
