"use client";

import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Reciprocal Rank Fusion, made draggable.
 *
 * Every hybrid-search stack ships k = 60 as a default and almost nobody can
 * say what it does to their rankings. The argument in the accompanying post is
 * that k sets how much a single retriever is allowed to dominate on its own
 * confidence — small k trusts confidence, large k trusts consensus. This
 * instrument is that argument made checkable: drag k and watch the fused
 * ordering reorder underneath you.
 *
 * The scenarios are constructed, not sampled — each one isolates a single
 * behaviour cleanly enough to see. Their crossovers are asserted in the numbers
 * quoted in `blurb`, so if the rank data is ever edited, re-check them.
 */

const K_MIN = 1;
const K_MAX = 200;
const K_DEFAULT = 60;
const CURVE_RANKS = 10;

type Doc = {
  id: string;
  title: string;
  /** 1-indexed position in each retriever's list. */
  bm25: number;
  dense: number;
};

type Scenario = {
  id: string;
  label: string;
  query: string;
  blurb: string;
  docs: Doc[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "consensus",
    label: "Confidence vs consensus",
    query: "termination for convenience — notice period",
    blurb:
      "BM25 is certain (rank 1); the dense retriever barely ranks that clause at all. A duller document that both retrievers merely quite like is waiting to overtake it. The top result flips at k = 63 — three units from the default everyone ships.",
    docs: [
      { id: "A", title: "§4(2)(b) — Termination for convenience", bm25: 1, dense: 18 },
      { id: "B", title: "Notice periods — general obligations", bm25: 8, dense: 9 },
      { id: "C", title: "§4(2)(c) — Termination for cause", bm25: 2, dense: 20 },
      { id: "D", title: "Schedule 3 — Notice and cure periods", bm25: 11, dense: 7 },
      { id: "E", title: "Termination: summary of obligations", bm25: 14, dense: 6 },
      { id: "F", title: "§7 — Survival of obligations", bm25: 4, dense: 15 },
      { id: "G", title: "Definitions — “Convenience”", bm25: 9, dense: 12 },
      { id: "H", title: "Master agreement — recitals", bm25: 17, dense: 19 },
    ],
  },
  {
    id: "citation",
    label: "Exact citation",
    query: "§4(2)(b)",
    blurb:
      "Here BM25 isn't merely better, it is correct — an exact statutory reference — and the dense retriever is noise. Consensus-weighting dilutes a retriever that already had the answer at rank 1: past k = 7 the right clause loses to a plausible neighbour. This is the failure the default hides.",
    docs: [
      { id: "A", title: "§4(2)(b) — Termination for convenience", bm25: 1, dense: 25 },
      { id: "B", title: "Notice and cure — commentary", bm25: 6, dense: 5 },
      { id: "C", title: "§4(2)(c) — Termination for cause", bm25: 2, dense: 19 },
      { id: "D", title: "Obligations on termination", bm25: 9, dense: 8 },
      { id: "E", title: "Schedule 3 — Notice periods", bm25: 13, dense: 14 },
      { id: "F", title: "§4(1) — Term and renewal", bm25: 5, dense: 17 },
      { id: "G", title: "Cross-reference index", bm25: 16, dense: 11 },
      { id: "H", title: "Master agreement — recitals", bm25: 20, dense: 22 },
    ],
  },
  {
    id: "complementary",
    label: "Complementary",
    query: "what happens to accrued liabilities after termination",
    blurb:
      "Fusion earning its complexity. Each retriever has a favourite the other dislikes, and both are beaten at every value of k by the document they independently agree on. Nothing flips here — when the retrievers genuinely complement each other, k stops mattering.",
    docs: [
      { id: "A", title: "§9 — Accrued rights and liabilities", bm25: 3, dense: 2 },
      { id: "B", title: "§4(2)(b) — Termination for convenience", bm25: 1, dense: 22 },
      { id: "C", title: "Post-termination settlement process", bm25: 19, dense: 1 },
      { id: "D", title: "§7 — Survival of obligations", bm25: 7, dense: 8 },
      { id: "E", title: "Schedule 5 — Final account", bm25: 5, dense: 16 },
      { id: "F", title: "Liabilities: worked examples", bm25: 15, dense: 6 },
      { id: "G", title: "Definitions — “Accrued”", bm25: 12, dense: 13 },
      { id: "H", title: "Master agreement — recitals", bm25: 22, dense: 25 },
    ],
  },
];

const rrfScore = (doc: Doc, k: number) => 1 / (k + doc.bm25) + 1 / (k + doc.dense);

/** Every k at which the top-ranked document changes identity. */
function findFlips(docs: Doc[]): { k: number; to: Doc }[] {
  const flips: { k: number; to: Doc }[] = [];
  let previous = "";
  for (let k = K_MIN; k <= K_MAX; k++) {
    const top = [...docs].sort((a, b) => rrfScore(b, k) - rrfScore(a, k))[0];
    if (top.id !== previous) {
      if (previous) flips.push({ k, to: top });
      previous = top.id;
    }
  }
  return flips;
}

/** Ranked column for a single retriever. */
function RetrieverList({
  label,
  aside,
  docs,
  rankOf,
  highlight,
}: {
  label: string;
  aside: string;
  docs: Doc[];
  rankOf: (d: Doc) => number;
  highlight: string | null;
}) {
  const ordered = [...docs].sort((a, b) => rankOf(a) - rankOf(b)).slice(0, 6);

  return (
    <div className="min-w-0 bg-panel">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="label">{label}</span>
        <span className="label text-[10px] normal-case tracking-normal">{aside}</span>
      </div>
      <ol className="divide-y divide-line">
        {ordered.map((doc) => (
          <li
            key={doc.id}
            className={cn(
              "flex items-baseline gap-3 px-4 py-2.5 text-sm",
              highlight === doc.id && "bg-panel-hi",
            )}
          >
            <span
              className={cn(
                "tabular w-5 shrink-0 font-mono text-xs",
                highlight === doc.id ? "text-signal" : "text-muted",
              )}
            >
              {rankOf(doc)}
            </span>
            <span
              className={cn(
                "min-w-0 truncate",
                highlight === doc.id ? "text-fg" : "text-dim",
              )}
            >
              {doc.title}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RrfLab() {
  const sliderId = useId();
  const [k, setK] = useState(K_DEFAULT);
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const fused = useMemo(
    () =>
      [...scenario.docs]
        .map((doc) => ({ doc, score: rrfScore(doc, k) }))
        .sort((a, b) => b.score - a.score),
    [scenario, k],
  );

  const flips = useMemo(() => findFlips(scenario.docs), [scenario]);
  const topId = fused[0].doc.id;

  /**
   * Bars are scaled across the visible range, not from zero. At k = 60 every
   * score sits within a few percent of the maximum, so a zero-based bar is
   * uniformly full and shows nothing — which is itself the lesson, but an
   * unreadable one. Spreading min→max makes the ordering legible while a
   * near-tie at the top still reads as a near-tie.
   */
  const hi = fused[0].score;
  const lo = fused[fused.length - 1].score;
  const barWidth = (score: number) => 6 + 94 * (hi === lo ? 1 : (score - lo) / (hi - lo));

  // Normalised so the curve shows shape rather than magnitude: every k starts
  // at 1.0 for rank 1, and the tail height is the whole story.
  const curve = Array.from({ length: CURVE_RANKS }, (_, i) => (k + 1) / (k + i + 1));
  const spread = (1 / (k + 1) / (1 / (k + CURVE_RANKS))).toFixed(2);

  return (
    <div className="not-prose my-10 border border-line corner-ticks">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line px-4 py-3">
        <span className="label text-fg">Reciprocal Rank Fusion</span>
        <span className="font-mono text-[11px] text-muted">
          RRF(d) = Σ 1 / (k + rank<sub>r</sub>(d))
        </span>
      </div>

      {/* Scenario picker */}
      <div className="flex flex-wrap gap-px border-b border-line bg-line">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenarioId(s.id)}
            aria-pressed={s.id === scenarioId}
            className={cn(
              "flex-1 bg-panel px-4 py-2.5 font-mono text-[11px] tracking-wider uppercase transition-colors",
              "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-signal",
              s.id === scenarioId
                ? "bg-panel-hi text-signal"
                : "text-muted hover:text-fg",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="border-b border-line px-4 py-3">
        <p className="font-mono text-[11px] text-muted">
          QUERY <span className="text-dim">“{scenario.query}”</span>
        </p>
      </div>

      {/* The two input rankings */}
      <div className="grid gap-px border-b border-line bg-line sm:grid-cols-2">
        <RetrieverList
          label="BM25 · lexical"
          aside="exact terms"
          docs={scenario.docs}
          rankOf={(d) => d.bm25}
          highlight={topId}
        />
        <RetrieverList
          label="Dense · vector"
          aside="paraphrase"
          docs={scenario.docs}
          rankOf={(d) => d.dense}
          highlight={topId}
        />
      </div>

      {/* k control */}
      <div className="border-b border-line px-4 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={sliderId} className="label">
            k — rank discount
          </label>
          <output
            htmlFor={sliderId}
            className="tabular font-mono text-2xl leading-none font-semibold text-signal"
          >
            {k}
          </output>
        </div>

        <input
          id={sliderId}
          type="range"
          min={K_MIN}
          max={K_MAX}
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
          aria-valuetext={`k equals ${k}. Top result: ${fused[0].doc.title}`}
          className="mt-4 w-full accent-signal"
        />

        {/* Two rows rather than three columns: at 390px the endpoint captions
            and the reset button can't share a line without wrapping badly. */}
        <div className="mt-2 font-mono text-[10px] text-muted">
          <div className="flex justify-between gap-4">
            <span>{K_MIN} — trusts confidence</span>
            <span className="text-right">trusts consensus — {K_MAX}</span>
          </div>
          <div className="mt-2.5 text-center">
            <button
              type="button"
              onClick={() => setK(K_DEFAULT)}
              className="underline decoration-line-hi underline-offset-4 transition-colors hover:text-fg"
            >
              reset to 60 (the default)
            </button>
          </div>
        </div>
      </div>

      {/* Fused output */}
      <div className="bg-panel">
        <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
          <span className="label text-signal">Fused ranking</span>
          <span className="label text-[10px] normal-case tracking-normal">
            score · bm25/dense rank
          </span>
        </div>
        <ol className="divide-y divide-line">
          {fused.map(({ doc, score }, i) => (
            <li key={doc.id} className="relative px-4 py-2.5">
              {/* Score bar, drawn behind the row so the ordering stays visible
                  when the numbers agree to four decimal places. */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 transition-[width] duration-150",
                  i === 0 ? "bg-signal-dim/40" : "bg-signal-dim/20",
                )}
                style={{ width: `${barWidth(score)}%` }}
                aria-hidden
              />
              <div className="relative flex items-baseline gap-3 text-sm">
                <span
                  className={cn(
                    "tabular w-5 shrink-0 font-mono text-xs",
                    i === 0 ? "text-signal" : "text-muted",
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn("min-w-0 flex-1 truncate", i === 0 ? "text-fg" : "text-dim")}>
                  {doc.title}
                </span>
                <span className="tabular shrink-0 font-mono text-xs text-muted">
                  {doc.bm25}/{doc.dense}
                </span>
                <span
                  className={cn(
                    "tabular w-16 shrink-0 text-right font-mono text-xs",
                    i === 0 ? "text-signal" : "text-dim",
                  )}
                >
                  {score.toFixed(5)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Weight curve + readout */}
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-[1fr_auto]">
        <div className="bg-panel px-4 py-4">
          <p className="label mb-3">Weight by rank — 1/(k+rank), normalised</p>
          {/* preserveAspectRatio="none" so the plot fills whatever width it
              gets; every stroke is non-scaling, and the rank markers are
              vertical ticks rather than dots so the x-stretch can't deform
              them. */}
          <svg
            viewBox="0 0 320 96"
            preserveAspectRatio="none"
            className="h-24 w-full"
            role="img"
            aria-hidden
          >
            <line
              x1="0"
              y1="88"
              x2="320"
              y2="88"
              stroke="var(--color-line-hi)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1={88 - curve[CURVE_RANKS - 1] * 74}
              x2="320"
              y2={88 - curve[CURVE_RANKS - 1] * 74}
              stroke="var(--color-line-hi)"
              strokeWidth="1"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={curve.map((v, i) => `${i * (320 / (CURVE_RANKS - 1))},${88 - v * 74}`).join(" ")}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            {curve.map((v, i) => {
              const x = i * (320 / (CURVE_RANKS - 1));
              return (
                <line
                  key={i}
                  x1={x}
                  y1={88 - v * 74 - 3}
                  x2={x}
                  y2={88 - v * 74 + 3}
                  stroke="var(--color-signal)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          <p className="mt-1 flex justify-between font-mono text-[10px] text-muted">
            <span>rank 1</span>
            <span>rank {CURVE_RANKS}</span>
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 bg-panel px-5 py-4 sm:w-52">
          <div>
            <p className="label mb-1.5">Rank 1 : rank 10</p>
            <p className="tabular font-mono text-xl font-semibold text-fg">{spread}×</p>
          </div>
          <div>
            <p className="label mb-1.5">Top result</p>
            <p aria-live="polite" className="text-sm leading-snug text-dim">
              {fused[0].doc.title}
            </p>
          </div>
        </div>
      </div>

      {/* Commentary */}
      <div className="border-t border-line px-4 py-4">
        <p className="text-sm leading-relaxed text-dim">{scenario.blurb}</p>
        {flips.length > 0 ? (
          <p className="mt-3 font-mono text-[11px] text-muted">
            {flips.map((f) => (
              <button
                key={f.k}
                type="button"
                onClick={() => setK(f.k)}
                className="text-signal underline decoration-signal-dim underline-offset-4 transition-colors hover:decoration-signal"
              >
                jump to the flip at k = {f.k}
              </button>
            ))}
          </p>
        ) : (
          <p className="mt-3 font-mono text-[11px] text-muted">
            No flip anywhere in {K_MIN}–{K_MAX}. The retrievers agree.
          </p>
        )}
      </div>
    </div>
  );
}
