import Link from "next/link";

import type { PostMeta } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * What backs a post's claims, stated on the post itself.
 *
 * The site's argument is that the work is rigorous, and the cheapest way to
 * undermine that is to let an unmeasured argument read as a measured one.
 * So every post declares which it is. The badge deliberately does not use the
 * amber signal: it is a standing property of the post, not live state, and
 * amber is reserved for the latter.
 */

type Evidence = PostMeta["evidence"];

const COPY: Record<Evidence, { label: string; detail: string; title: string }> = {
  measured: {
    label: "Measured",
    detail: "claims backed by figures reproduced here",
    title:
      "The load-bearing claims in this post are backed by benchmark figures reproduced in it.",
  },
  reasoned: {
    label: "Reasoned",
    detail: "argued from building it — no benchmark shown",
    title:
      "An argument from having built the system. No benchmark figures are shown; where numbers would settle a question, this post does not yet have them.",
  },
  superseded: {
    label: "Superseded",
    detail: "revised by a later post",
    title: "A later post revises or replaces the argument here.",
  },
};

export function EvidenceBadge({
  evidence,
  supersededBy,
  detail = false,
  className,
}: {
  evidence: Evidence;
  supersededBy?: string;
  /** Show the qualifying phrase alongside the pill. Post headers only —
   *  on a card it costs more room than it earns. */
  detail?: boolean;
  className?: string;
}) {
  const copy = COPY[evidence];

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2.5 gap-y-1", className)}>
      <span
        title={copy.title}
        className={cn(
          "px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase",
          // Solid hairline reads as settled, dashed as provisional. The
          // distinction has to survive being the only difference between them.
          evidence === "measured" && "border border-line-hi text-fg",
          evidence === "reasoned" && "border border-dashed border-line-hi text-muted",
          evidence === "superseded" && "border border-line text-muted",
        )}
      >
        {copy.label}
      </span>

      {detail ? (
        <span className="font-mono text-[10px] tracking-wide text-muted">
          {copy.detail}
          {evidence === "superseded" && supersededBy ? (
            <>
              {" — "}
              <Link
                href={`/blog/${supersededBy}`}
                className="underline decoration-line-hi underline-offset-2 transition-colors hover:text-fg"
              >
                read the current one
              </Link>
            </>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
