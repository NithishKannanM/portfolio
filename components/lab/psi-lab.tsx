"use client";

import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Free bytes versus PSI, made draggable.
 *
 * Almost every memory-pressure alert in production is a threshold on free
 * bytes, and the reason that keeps failing is not that the threshold is badly
 * tuned — it is that free bytes is a *level* and pressure is a *rate*. A
 * machine can sit at a comfortable free-memory figure while reclaim runs flat
 * out underneath it, refaulting the pages it just dropped. The level looks
 * fine because reclaim is succeeding; the cost is paid in stall time, which
 * the level cannot see at all.
 *
 * The instrument is that argument made checkable. One knob — the free-bytes
 * threshold — against three workloads, and the visitor discovers there is no
 * setting that handles all three. That is a stronger claim than "PSI is
 * better", so it is computed rather than asserted: `CLEAN_THRESHOLDS` sweeps
 * every value and the prose reports what the sweep found.
 *
 * The traces are constructed, not sampled — each isolates one behaviour
 * cleanly enough to see, the same way the RRF scenarios do. They illustrate a
 * mechanism; they are not benchmark results, and the page says so.
 */

const STEPS = 40;
const BUDGET_MB = 400;

/** Where the PSI policy trips. `some avg10 > 20%` is a common starting point
 *  and, unlike the free-bytes threshold, it survives all three workloads. */
const PSI_TRIP = 20;

const THRESHOLD_DEFAULT = 100;
/** Steps a policy may lag the onset of stalls before it counts as late. */
const GRACE = 2;

type Trace = {
  id: string;
  label: string;
  blurb: string;
  /**
   * The window in which the workload is actually costing the user — tasks
   * stalling on refaults, cold starts accruing. Ground truth, defined by the
   * harm rather than by either policy, so neither gets to mark its own work.
   */
  trouble: [number, number] | null;
  /** MB free of BUDGET_MB. */
  free: number[];
  /** memory.pressure `some avg10`, percent. */
  psi: number[];
};

const series = (fn: (t: number) => number) =>
  Array.from({ length: STEPS }, (_, t) => Math.max(0, fn(t)));

const TRACES: Trace[] = [
  {
    id: "refault",
    label: "Refault storm",
    blurb:
      "The working set is a little larger than what fits, so reclaim runs continuously and every page it drops is wanted again seconds later. Free memory never looks alarming — reclaim is keeping it healthy, and that is exactly the problem. The cost shows up as stall time, and only one of these two signals is measuring it.",
    trouble: [16, STEPS - 1],
    // Drifts down to a comfortable plateau and stays there. Nothing to see.
    free: series((t) => 330 - 48 * Math.min(1, t / 16) + 4 * Math.sin(t / 2)),
    // Reclaim ramps up and the stalls come with it.
    psi: series((t) => 2 + 54 / (1 + Math.exp(-(t - 16) / 2.2))),
  },
  {
    id: "burst",
    label: "Burst allocation",
    blurb:
      "A large app launches and takes the budget down with it. This is the case free bytes is actually built for, and with a high enough threshold it does fine — note when it fires versus when PSI does. Keep this scenario in mind while you raise the threshold to catch the first one.",
    trouble: [17, 27],
    free: series((t) =>
      t < 13
        ? 340 + 3 * Math.sin(t / 2)
        : t <= 24
          ? 340 - (t - 13) * 25.9
          : Math.min(300, 55 + (t - 24) * 24.5),
    ),
    psi: series((t) =>
      t < 14
        ? 3 + 1.5 * Math.sin(t / 2)
        : t <= 22
          ? 3 + ((t - 14) / 8) * 41
          : Math.max(4, 44 - ((t - 22) / 11) * 40),
    ),
  },
  {
    id: "churn",
    label: "Healthy churn",
    blurb:
      "Ordinary app switching. Free memory swings hard and often — that is the page cache doing its job, not distress — and the system is never in trouble. Every time a policy fires here it evicts something warm for nothing, and the user pays for it on their next launch. This is the scenario that punishes a high threshold.",
    trouble: null,
    free: series((t) => 250 + 72 * Math.sin(t / 1.3)),
    psi: series((t) => 3.5 + 3 * Math.sin(t / 2.3 + 1)),
  },
];

/* ------------------------------------------------------------------
   POLICIES
   ------------------------------------------------------------------ */

/** First step at which the signal is on the wrong side of the line. */
function firstCrossing(values: number[], limit: number, direction: "below" | "above") {
  for (let t = 0; t < values.length; t++) {
    if (direction === "below" ? values[t] < limit : values[t] > limit) return t;
  }
  return null;
}

/** How many separate times the signal crosses the line. On a workload that
 *  never needed intervention, every one of these is a warm app evicted for
 *  nothing. */
function countCrossings(values: number[], limit: number, direction: "below" | "above") {
  const isTripped = (v: number) => (direction === "below" ? v < limit : v > limit);
  let count = isTripped(values[0]) ? 1 : 0;
  for (let t = 1; t < values.length; t++) {
    if (isTripped(values[t]) && !isTripped(values[t - 1])) count++;
  }
  return count;
}

type Verdict =
  | { kind: "in-time"; at: number }
  | { kind: "late"; at: number; by: number }
  | { kind: "missed" }
  | { kind: "quiet" }
  | { kind: "false-alarms"; count: number };

function judge(trace: Trace, firedAt: number | null, crossings: number): Verdict {
  if (!trace.trouble) {
    return crossings > 0 ? { kind: "false-alarms", count: crossings } : { kind: "quiet" };
  }
  if (firedAt === null) return { kind: "missed" };
  // Firing before the stalls start is not a false alarm — the trouble does
  // arrive, and getting ahead of it is the whole job.
  const by = firedAt - trace.trouble[0];
  return by <= GRACE ? { kind: "in-time", at: firedAt } : { kind: "late", at: firedAt, by };
}

const isGood = (v: Verdict) => v.kind === "in-time" || v.kind === "quiet";

const freeVerdict = (trace: Trace, threshold: number) =>
  judge(
    trace,
    firstCrossing(trace.free, threshold, "below"),
    countCrossings(trace.free, threshold, "below"),
  );

const psiVerdict = (trace: Trace) =>
  judge(
    trace,
    firstCrossing(trace.psi, PSI_TRIP, "above"),
    countCrossings(trace.psi, PSI_TRIP, "above"),
  );

/**
 * Every free-bytes threshold that handles all three workloads cleanly.
 *
 * Computed at module load rather than asserted in prose, so if the traces are
 * ever edited the copy below cannot quietly become a lie.
 */
const CLEAN_THRESHOLDS = (() => {
  const clean: number[] = [];
  for (let threshold = 0; threshold <= BUDGET_MB; threshold++) {
    if (TRACES.every((trace) => isGood(freeVerdict(trace, threshold)))) clean.push(threshold);
  }
  return clean;
})();

const PSI_SWEEPS_CLEAN = TRACES.every((trace) => isGood(psiVerdict(trace)));

function verdictCopy(v: Verdict) {
  switch (v.kind) {
    case "in-time":
      return { text: `Acted at ${v.at}s`, tone: "good" as const };
    case "late":
      return { text: `Late by ${v.by}s`, tone: "bad" as const };
    case "missed":
      return { text: "Never fired", tone: "bad" as const };
    case "quiet":
      return { text: "Stayed quiet", tone: "good" as const };
    case "false-alarms":
      return {
        text: `${v.count} false ${v.count === 1 ? "alarm" : "alarms"}`,
        tone: "bad" as const,
      };
  }
}

/* ------------------------------------------------------------------
   PLOT
   ------------------------------------------------------------------ */

const PLOT_W = 320;
const PLOT_H = 44;
const x = (t: number) => (t / (STEPS - 1)) * PLOT_W;
const y = (value: number, max: number) => 4 + (1 - Math.min(value, max) / max) * (PLOT_H - 8);

/** One signal over time, with the trouble window shaded and the policy's
 *  trip point drawn as a dashed line. */
function Signal({
  values,
  max,
  limit,
  trouble,
  firedAt,
  colour,
}: {
  values: number[];
  max: number;
  limit: number;
  trouble: [number, number] | null;
  firedAt: number | null;
  colour: string;
}) {
  return (
    // preserveAspectRatio="none" so both plots fill their track and share an
    // x-axis exactly; every stroke is non-scaling so nothing deforms with it.
    // No text inside for the same reason — labels live in the markup.
    <svg
      viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
      preserveAspectRatio="none"
      className="h-11 w-full"
      aria-hidden
    >
      {trouble ? (
        <rect
          x={x(trouble[0])}
          y="0"
          width={x(trouble[1]) - x(trouble[0])}
          height={PLOT_H}
          fill="var(--color-bad)"
          opacity="0.14"
        />
      ) : null}

      <line
        x1="0"
        y1={y(limit, max)}
        x2={PLOT_W}
        y2={y(limit, max)}
        stroke="var(--color-line-hi)"
        strokeWidth="1"
        strokeDasharray="3 5"
        vectorEffect="non-scaling-stroke"
      />

      <polyline
        points={values.map((v, t) => `${x(t)},${y(v, max)}`).join(" ")}
        fill="none"
        stroke={colour}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />

      {firedAt !== null ? (
        <line
          x1={x(firedAt)}
          y1="0"
          x2={x(firedAt)}
          y2={PLOT_H}
          stroke={colour}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}

function Row({ label, aside, children }: { label: string; aside: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[4.5rem] shrink-0">
        <span className="label block leading-tight">{label}</span>
        {/* text-muted, not line-hi: line-hi is a border colour and fails
            contrast as text. See the note on --color-muted in globals.css. */}
        <span className="mt-0.5 block font-mono text-[9px] leading-tight text-muted">
          {aside}
        </span>
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

function Badge({ tone, children }: { tone: "good" | "bad"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "shrink-0 px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        tone === "good" ? "border border-line-hi text-good" : "border border-dashed border-bad text-bad",
      )}
    >
      {children}
    </span>
  );
}

function ScenarioPanel({ trace, threshold }: { trace: Trace; threshold: number }) {
  const free = freeVerdict(trace, threshold);
  const psi = psiVerdict(trace);
  const freeCopy = verdictCopy(free);
  const psiCopy = verdictCopy(psi);

  return (
    <div className="bg-panel px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span className="label text-fg">{trace.label}</span>
        <span className="label text-[10px] normal-case tracking-normal">
          {trace.trouble ? "stalls, shaded" : "never in trouble"}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <Row label="free MB" aside={`0–${BUDGET_MB}`}>
          <Signal
            values={trace.free}
            max={BUDGET_MB}
            limit={threshold}
            trouble={trace.trouble}
            firedAt={firstCrossing(trace.free, threshold, "below")}
            colour="var(--color-dim)"
          />
        </Row>
        <Row label="psi some" aside="avg10 %">
          <Signal
            values={trace.psi}
            max={100}
            limit={PSI_TRIP}
            trouble={trace.trouble}
            firedAt={firstCrossing(trace.psi, PSI_TRIP, "above")}
            colour="var(--color-signal)"
          />
        </Row>
      </div>

      {/* flex-wrap rather than a grid: this panel is full-width on mobile and
          a third of the width on desktop, and a viewport-keyed grid can't
          know which. */}
      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
        <div className="flex items-center gap-2.5">
          <dt className="label shrink-0">free</dt>
          <dd>
            <Badge tone={freeCopy.tone}>{freeCopy.text}</Badge>
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt className="label shrink-0">psi</dt>
          <dd>
            <Badge tone={psiCopy.tone}>{psiCopy.text}</Badge>
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-[13px] leading-relaxed text-dim">{trace.blurb}</p>
    </div>
  );
}

/* ------------------------------------------------------------------
   INSTRUMENT
   ------------------------------------------------------------------ */

export function PsiLab() {
  const sliderId = useId();
  const [threshold, setThreshold] = useState(THRESHOLD_DEFAULT);

  const tally = useMemo(() => {
    const count = (verdicts: Verdict[]) => ({
      missed: verdicts.filter((v) => v.kind === "missed").length,
      late: verdicts.filter((v) => v.kind === "late").length,
      alarms: verdicts.reduce((n, v) => n + (v.kind === "false-alarms" ? v.count : 0), 0),
    });
    return {
      free: count(TRACES.map((t) => freeVerdict(t, threshold))),
      psi: count(TRACES.map(psiVerdict)),
    };
  }, [threshold]);

  const summarise = (t: { missed: number; late: number; alarms: number }) =>
    `${t.missed} missed · ${t.late} late · ${t.alarms} false ${
      t.alarms === 1 ? "alarm" : "alarms"
    }`;

  const freeIsClean = tally.free.missed + tally.free.late + tally.free.alarms === 0;

  return (
    <div className="not-prose my-10 border border-line corner-ticks">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line px-4 py-3">
        <span className="label text-fg">Memory pressure — two ways to see it</span>
        <span className="font-mono text-[11px] text-muted">
          budget {BUDGET_MB} MB · psi trips at some avg10 &gt; {PSI_TRIP}%
        </span>
      </div>

      {/* The one control */}
      <div className="border-b border-line px-4 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={sliderId} className="label">
            Evict when free memory drops below
          </label>
          <output
            htmlFor={sliderId}
            className="tabular font-mono text-2xl leading-none font-semibold text-signal"
          >
            {threshold}
            <span className="ml-1 text-sm font-normal text-muted">MB</span>
          </output>
        </div>

        <input
          id={sliderId}
          type="range"
          min={0}
          max={BUDGET_MB}
          step={5}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          aria-valuetext={`Evict below ${threshold} megabytes. Across the three workloads: ${summarise(
            tally.free,
          )}.`}
          className="mt-4 w-full accent-signal"
        />

        <div className="mt-2 font-mono text-[10px] text-muted">
          <div className="flex justify-between gap-4">
            <span>0 — never intervenes</span>
            <span className="text-right">evicts constantly — {BUDGET_MB}</span>
          </div>
          <div className="mt-2.5 text-center">
            <button
              type="button"
              onClick={() => setThreshold(THRESHOLD_DEFAULT)}
              className="underline decoration-line-hi underline-offset-4 transition-colors hover:text-fg"
            >
              reset to {THRESHOLD_DEFAULT} MB (25% of budget — the usual first guess)
            </button>
          </div>
        </div>
      </div>

      {/* Three across on desktop. Stacked, each plot is stretched to roughly
          38:1 and the curves flatten into straight lines — and seeing all
          three verdicts at once is the entire argument anyway. */}
      <div className="grid gap-px bg-line lg:grid-cols-3">
        {TRACES.map((trace) => (
          <ScenarioPanel key={trace.id} trace={trace} threshold={threshold} />
        ))}
      </div>

      {/* Scoreboard */}
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
        <div className="bg-panel px-4 py-4">
          <p className="label mb-2">Free bytes @ {threshold} MB</p>
          <p
            aria-live="polite"
            className={cn(
              "tabular font-mono text-sm",
              freeIsClean ? "text-good" : "text-bad",
            )}
          >
            {summarise(tally.free)}
          </p>
        </div>
        <div className="bg-panel px-4 py-4">
          <p className="label mb-2">PSI @ some avg10 &gt; {PSI_TRIP}%</p>
          <p
            className={cn(
              "tabular font-mono text-sm",
              PSI_SWEEPS_CLEAN ? "text-good" : "text-bad",
            )}
          >
            {summarise(tally.psi)}
          </p>
        </div>
      </div>

      {/* The finding, computed rather than claimed */}
      <div className="border-t border-line px-4 py-4">
        <p className="text-sm leading-relaxed text-dim">
          {CLEAN_THRESHOLDS.length === 0 ? (
            <>
              Swept every threshold from 0 to {BUDGET_MB} MB:{" "}
              <span className="text-fg">not one of them handles all three workloads.</span>{" "}
              Low enough to leave healthy churn alone is too low to catch the refault storm;
              high enough to catch the storm evicts warm apps all through the churn. The knob
              is not mistuned — it is reading the wrong quantity.
            </>
          ) : (
            <>
              Swept every threshold from 0 to {BUDGET_MB} MB:{" "}
              {CLEAN_THRESHOLDS.length} of them handle all three workloads, starting at{" "}
              {CLEAN_THRESHOLDS[0]} MB.
            </>
          )}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-dim">
          PSI does it with one number because it is measuring a different kind of thing.
          Free bytes is a level, and a level says nothing about what it cost to hold. PSI is
          time — the share of the last ten seconds in which some task sat waiting on memory.
          That is the same stall the user feels, which is why it does not need retuning per
          workload.
        </p>
      </div>
    </div>
  );
}
