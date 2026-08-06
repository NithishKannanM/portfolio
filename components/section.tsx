import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Standard page section: max width, gutter, vertical rhythm. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-6xl px-6 py-20", className)}>
      {children}
    </section>
  );
}

/**
 * Section heading with a numeric channel marker. The index reads like a
 * labelled input on an instrument panel and gives the page a spine.
 */
export function SectionHeading({
  index,
  title,
  aside,
  className,
}: {
  index: string;
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex items-end justify-between gap-6 border-b border-line pb-4", className)}>
      <div className="flex items-baseline gap-4">
        <span className="label text-line-hi">{index}</span>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

/** Title block for interior pages (/work, /blog, /about, /contact). */
export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-12">
        <p className="label mb-5">{eyebrow}</p>
        <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
          {title}
        </h1>
        {lead ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-dim">{lead}</p> : null}
      </div>
    </header>
  );
}
