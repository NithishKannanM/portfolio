import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ReactNode } from "react";

import { RrfLab } from "@/components/lab/rrf-lab";
import { mdxOptions } from "@/lib/mdx-options";
import { cn } from "@/lib/utils";

/**
 * Aside for caveats and asides in long-form posts. `tone="warn"` picks up
 * the amber signal — reserve it for genuine gotchas.
 */
function Note({
  children,
  tone = "info",
  label,
}: {
  children: ReactNode;
  tone?: "info" | "warn";
  label?: string;
}) {
  return (
    <aside
      className={cn(
        "border-l bg-panel px-5 py-4 text-sm leading-relaxed",
        tone === "warn" ? "border-signal" : "border-line-hi",
      )}
    >
      {label ? (
        <p className={cn("label mb-2", tone === "warn" && "text-signal")}>{label}</p>
      ) : null}
      <div className="[&>*+*]:mt-3 [&>p]:m-0">{children}</div>
    </aside>
  );
}

/** Captioned block for diagrams and results tables. */
function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure className="my-8">
      <div className="border border-line bg-panel p-5 [&>*]:m-0">{children}</div>
      <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

/** Two-up comparison, used for before/after and baseline/ours. */
function Compare({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 grid gap-px border border-line bg-line sm:grid-cols-2">{children}</div>
  );
}

function Side({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-panel p-5">
      <p className="label mb-3">{label}</p>
      <div className="text-sm leading-relaxed text-dim [&>*+*]:mt-3 [&>*]:m-0">{children}</div>
    </div>
  );
}

/** Placeholder for figures Nithish still needs to supply. Renders visibly
 *  so it can't ship unnoticed. */
function Todo({ children }: { children: ReactNode }) {
  return (
    <p className="border border-dashed border-signal-dim bg-panel px-4 py-3 font-mono text-xs text-signal">
      TODO — {children}
    </p>
  );
}

function Anchor({ href = "", children, ...rest }: React.ComponentProps<"a">) {
  const internal = href.startsWith("/") || href.startsWith("#");
  if (internal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

const components = { Note, Figure, Compare, Side, Todo, RrfLab, a: Anchor };

export function Mdx({ source }: { source: string }) {
  return (
    // min-w-0: as a grid child this would otherwise be floored at its
    // min-content width, widening the track past the viewport on mobile.
    <div className="prose min-w-0">
      {/* @ts-expect-error — async Server Component */}
      <MDXRemote source={source} options={{ mdxOptions }} components={components} />
    </div>
  );
}
