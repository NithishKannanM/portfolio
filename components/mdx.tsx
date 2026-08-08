import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ReactNode } from "react";

import { PsiLab } from "@/components/lab/psi-lab";
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

/**
 * A measured results table.
 *
 * The reason this exists rather than a markdown table: results are the part of
 * a post that has to be trustworthy, so the component makes provenance a
 * required field. `source` should name the script and commit that produced the
 * numbers, so a reader — or you, in a year — can go and re-run it.
 *
 * A post carrying one of these should also flip its frontmatter to
 * `evidence: measured`.
 */
type ResultRow = {
  label: string;
  /** One entry per column, in the same order as `columns`. */
  values: (number | string)[];
  /** Renders the row as the winner. At most one. */
  best?: boolean;
};

function Results({
  columns,
  rows,
  caption,
  source,
  better = "higher",
}: {
  columns: string[];
  rows: ResultRow[];
  caption?: string;
  /** Script and commit that produced these numbers. */
  source: string;
  better?: "higher" | "lower";
}) {
  const malformed = rows.find((r) => r.values.length !== columns.length);
  if (rows.length === 0 || malformed) {
    // Same discipline as <Todo>: a broken results table must be impossible to
    // ship silently, because the failure mode is a post that looks measured
    // and isn't.
    return (
      <p className="border border-dashed border-signal-dim bg-panel px-4 py-3 font-mono text-xs text-signal">
        RESULTS TABLE INCOMPLETE —{" "}
        {rows.length === 0
          ? "no rows supplied"
          : `row “${malformed?.label}” has ${malformed?.values.length} values for ${columns.length} columns`}
      </p>
    );
  }

  return (
    <div className="not-prose my-8 border border-line corner-ticks">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="label text-fg">Measured</span>
        <span className="label text-[10px] normal-case tracking-normal">
          {better} is better
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="label border-b border-line-hi px-4 py-2.5 text-left font-normal"
              >
                Variant
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="label border-b border-line-hi px-4 py-2.5 text-right font-normal whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={cn(row.best && "bg-panel-hi")}>
                <th
                  scope="row"
                  className={cn(
                    "border-b border-line px-4 py-2.5 text-left font-normal whitespace-nowrap",
                    row.best ? "text-fg" : "text-dim",
                  )}
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={columns[i]}
                    className={cn(
                      "tabular border-b border-line px-4 py-2.5 text-right font-mono",
                      row.best ? "text-signal" : "text-dim",
                    )}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-line px-4 py-3">
        {caption ? (
          <p className="text-[13px] leading-relaxed text-dim">{caption}</p>
        ) : null}
        <p className={cn("font-mono text-[10px] text-muted", caption && "mt-2")}>
          SOURCE <span className="text-dim">{source}</span>
        </p>
      </div>
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

const components = { Note, Figure, Compare, Side, Results, Todo, PsiLab, RrfLab, a: Anchor };

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
