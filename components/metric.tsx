"use client";

import { animate, createTimeline } from "animejs";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import type { Metric } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * anime.js set-piece #1 — the instrument readout.
 *
 * A counter ticks up to the real figure while the bar fills, then the
 * baseline delta resolves after. This is genuinely imperative choreography
 * (three targets on one shared clock, one of them a plain JS object driving
 * textContent), which is exactly what anime.js timelines are better at than
 * declarative variants.
 *
 * Perf: the counter writes to `textContent` on a ref rather than through
 * React state, so a 900ms count-up costs zero re-renders. The bar animates
 * `scaleX`, not `width`, so it stays on the compositor.
 */
export function MetricReadout({
  metric,
  className,
}: {
  metric: Metric;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const numeric = typeof metric.value === "number" ? metric.value : null;
  const decimals =
    numeric !== null && !Number.isInteger(numeric)
      ? String(numeric).split(".")[1]?.length ?? 0
      : 0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    // Counter — animate a plain object, write straight to the DOM node.
    if (numeric !== null && valueRef.current) {
      const node = valueRef.current;
      const counter = { v: 0 };
      tl.add(
        counter,
        {
          v: numeric,
          duration: 900,
          onUpdate: () => {
            node.textContent = counter.v.toFixed(decimals);
          },
        },
        0,
      );
    }

    // scaleX rather than width — stays on the compositor. Default state is
    // scaleX(1), so the bar reads correctly even if this never plays.
    if (barRef.current) {
      tl.add(barRef.current, { scaleX: [0, 1], duration: 900 }, 0);
    }

    // Reduced motion: land on the finished state on the first frame.
    if (reduce) {
      tl.complete();
      return () => void tl.revert();
    }

    tl.pause();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tl.play();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      tl.revert();
    };
  }, [numeric, decimals, reduce]);

  const delta = computeDelta(metric);

  return (
    <div ref={rootRef} className={cn("group min-w-0", className)} data-metric>
      <div className="label mb-2.5 break-words">{metric.label}</div>

      <div className="flex flex-wrap items-baseline gap-x-1">
        {/* Numerals get the full display size; string values ("EMNLP/ACL",
            "≤7", "PyPI") are set smaller so they don't overflow a narrow
            column on mobile. */}
        <span
          className={cn(
            "font-mono leading-none tracking-tight text-fg tabular-nums break-words",
            numeric !== null ? "text-3xl" : "text-xl",
          )}
        >
          {/* Render the true figure, not a zero placeholder. If JS never runs
              or the observer never fires, the reader still sees real data —
              the count-up overwrites this only once it actually plays. */}
          {numeric !== null ? (
            <span ref={valueRef}>{numeric.toFixed(decimals)}</span>
          ) : (
            metric.value
          )}
        </span>
        {metric.unit ? (
          <span className="font-mono text-sm text-muted">{metric.unit}</span>
        ) : null}
      </div>

      {metric.fill !== undefined ? (
        <div className="mt-3 h-px w-full bg-line" aria-hidden>
          <div
            ref={barRef}
            className="h-px origin-left bg-signal"
            style={{ width: `${metric.fill * 100}%` }}
          />
        </div>
      ) : null}

      {delta || metric.note ? (
        <div className="mt-2.5 font-mono text-[11px] leading-relaxed break-words">
          {delta ? (
            <span className={delta.improved ? "text-good" : "text-bad"}>
              {delta.arrow} {delta.text}
            </span>
          ) : null}
          {metric.note ? (
            <span className="block text-muted">{metric.note}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Renders the "↑ 86% baseline" line under a figure. */
function computeDelta(metric: Metric) {
  if (metric.baseline === undefined) return null;

  const label = metric.baselineLabel ?? "baseline";
  const text = `${metric.baseline}${metric.unit ?? ""} ${label}`;

  if (typeof metric.value !== "number" || typeof metric.baseline !== "number") {
    return { improved: true, arrow: "vs", text };
  }

  const higherIsBetter = metric.better !== "lower";
  const improved = higherIsBetter
    ? metric.value > metric.baseline
    : metric.value < metric.baseline;

  return {
    improved,
    arrow: metric.value > metric.baseline ? "↑" : "↓",
    text,
  };
}

/**
 * Horizontal strip of readouts, hairline-separated. Used at the top of a
 * case study and in the featured project panels.
 */
export function MetricStrip({
  metrics,
  className,
}: {
  metrics: Metric[];
  className?: string;
}) {
  if (metrics.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4",
        className,
      )}
    >
      {metrics.map((metric) => (
        <MetricReadout key={metric.label} metric={metric} className="p-5" />
      ))}
    </div>
  );
}

/** Small live-status lamp. Amber pulses only for actively-running work. */
export function StatusDot({ status }: { status: "shipped" | "active" | "research" }) {
  const tone = {
    shipped: "bg-good",
    active: "bg-signal",
    research: "bg-muted",
  }[status];

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-1.5 w-1.5">
        {status === "active" ? (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60"
            aria-hidden
          />
        ) : null}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", tone)} />
      </span>
      <span className="label">{status}</span>
    </span>
  );
}

/** Animate a bare number in prose or a stat block. */
export function Counter({
  to,
  decimals = 0,
  className,
}: {
  to: number;
  decimals?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const counter = { v: 0 };
    const anim = animate(counter, {
      v: to,
      duration: 900,
      ease: "outExpo",
      autoplay: false,
      onUpdate: () => {
        node.textContent = counter.v.toFixed(decimals);
      },
    });

    if (reduce) {
      anim.complete();
      return () => void anim.revert();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          anim.play();
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      anim.revert();
    };
  }, [to, decimals, reduce]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {to.toFixed(decimals)}
    </span>
  );
}
