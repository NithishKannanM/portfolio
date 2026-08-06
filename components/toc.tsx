"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Sticky table of contents with scroll-spy. The active marker is a hairline
 * in the gutter rather than a filled pill — same instrument logic as the
 * rest of the site.
 */
export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the band toward the top of the viewport so the highlighted
      // entry matches what the reader is actually looking at.
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="label mb-4">On this page</p>
      <ul className="space-y-0.5 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1.5 text-xs leading-snug transition-colors",
                heading.level === 3 ? "pl-7" : "pl-4",
                active === heading.id
                  ? "border-signal text-fg"
                  : "border-transparent text-muted hover:text-dim",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
