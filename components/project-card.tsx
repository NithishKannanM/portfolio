import Link from "next/link";

import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";
import { MetricReadout, StatusDot } from "@/components/metric";
import { Panel, PanelHeader } from "@/components/panel";

/**
 * Featured project panel. Reads as an instrument channel: labelled header,
 * a body, and live readouts along the bottom.
 */
export function ProjectPanel({
  project,
  className,
  headingLevel = "h3",
}: {
  project: Project;
  className?: string;
  /** h2 where panels sit directly under the page h1 (/work); h3 where they
   *  sit under a section heading (home). Keeps the outline gap-free. */
  headingLevel?: "h2" | "h3";
}) {
  const metrics = project.metrics.slice(0, 3);
  const Heading = headingLevel;

  return (
    <Panel
      as="article"
      corners
      className={cn("group flex flex-col transition-colors hover:border-line-hi", className)}
    >
      <PanelHeader
        label={<StatusDot status={project.status} />}
        aside={project.period}
      />

      <div className="flex flex-1 flex-col p-5">
        <Heading className="text-lg font-semibold tracking-tight text-balance">
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-1 font-mono text-xs text-signal">{project.subtitle}</p>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-dim">{project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 5).map((tech) => (
            <li
              key={tech}
              className="border border-line px-2 py-1 font-mono text-[10px] tracking-wide text-muted"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      {/* Stacked on phones — three columns inside a card is roughly 100px
          each at 390px, which clips long labels and string values. */}
      {metrics.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-1 divide-y divide-line border-t border-line sm:divide-x sm:divide-y-0",
            metrics.length === 1 && "sm:grid-cols-1",
            metrics.length === 2 && "sm:grid-cols-2",
            metrics.length >= 3 && "sm:grid-cols-3",
          )}
        >
          {metrics.map((metric) => (
            <MetricReadout key={metric.label} metric={metric} className="p-4" />
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

/** Compact row for the /work index and the "also shipped" list. */
export function ProjectRow({
  project,
  headingLevel = "h3",
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <li className="group relative border-b border-line">
      <Link
        href={`/work/${project.slug}`}
        className="flex flex-col gap-2 py-6 transition-colors sm:flex-row sm:items-baseline sm:gap-8"
      >
        <div className="min-w-0 flex-1">
          <Heading className="text-base font-medium tracking-tight transition-colors group-hover:text-signal">
            {project.title}
          </Heading>
          <p className="mt-1 text-sm text-muted">{project.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-6">
          {project.period ? <span className="label">{project.period}</span> : null}
          <span
            className="font-mono text-xs text-line-hi transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-signal"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}
