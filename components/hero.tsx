"use client";

import { createDrawable, createTimeline, stagger } from "animejs";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { site } from "@/lib/site";

/**
 * A memory-pressure trace: noisy under load, converging once the
 * orchestrator settles. Deliberately not decorative noise — it's the shape
 * of the problem the work is about.
 */
const TRACE =
  "M0,62 L40,58 L80,64 L120,42 L160,57 L200,18 L240,54 L280,34 L320,66 " +
  "L360,26 L400,60 L440,10 L480,48 L520,40 L560,55 L600,46 L640,51 " +
  "L680,49 L720,50 L760,50 L800,50";

export function Hero() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    tl.add(
      root.querySelectorAll("[data-hero-rule]"),
      { scaleX: [0, 1], duration: 700, delay: stagger(60) },
      0,
    )
      .add(
        root.querySelectorAll("[data-hero-word]"),
        { opacity: [0, 1], y: [14, 0], duration: 620, delay: stagger(45) },
        120,
      )
      .add(
        root.querySelectorAll("[data-hero-line]"),
        { opacity: [0, 1], y: [8, 0], duration: 520, delay: stagger(70) },
        320,
      )
      // The trace draws itself left to right, then the baseline fades up
      // underneath it.
      .add(
        createDrawable(root.querySelectorAll("[data-hero-trace]")),
        { draw: ["0 0", "0 1"], duration: 1400 },
        420,
      )
      .add(root.querySelectorAll("[data-hero-baseline]"), { opacity: [0, 1], duration: 400 }, 900);

    if (reduce) {
      tl.complete();
    }

    return () => void tl.revert();
  }, [reduce]);

  const words = site.name.split(" ");

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b border-line"
      aria-labelledby="hero-name"
    >
      <div className="pointer-events-none absolute inset-0 grid-field opacity-60" aria-hidden />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-0 sm:pt-28">
        {/* Status line */}
        <div
          data-hero-line
          data-reveal
          className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 opacity-0"
        >
          <span className="label flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            {site.location}
          </span>
          <span className="label">B.Tech CSE · VIT Chennai</span>
        </div>

        <div data-hero-rule data-reveal className="mb-10 h-px origin-left bg-line" aria-hidden />

        {/* Name */}
        <h1
          id="hero-name"
          className="text-[clamp(2.75rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]"
        >
          {words.map((word, i) => (
            <span key={word} className="inline-block overflow-hidden align-bottom">
              <span data-hero-word data-reveal className="inline-block opacity-0">
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h1>

        {/* Thesis */}
        <p
          data-hero-line
          data-reveal
          className="mt-8 max-w-xl text-lg leading-relaxed text-dim opacity-0 sm:text-xl"
        >
          I build AI systems that <span className="text-fg">remember</span>,{" "}
          <span className="text-fg">retrieve</span>, and{" "}
          <span className="text-fg">know when to stop</span> — hybrid retrieval,
          predictive memory orchestration, and reliability for agent loops.
        </p>

        {/* Actions */}
        <div data-hero-line data-reveal className="mt-10 flex flex-wrap items-center gap-3 opacity-0">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 border border-line-hi bg-panel px-5 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors hover:border-signal hover:text-signal"
          >
            View work
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center border border-line px-5 py-2.5 font-mono text-xs tracking-wider uppercase text-dim transition-colors hover:border-line-hi hover:text-fg"
          >
            Writing
          </Link>
          <a
            href={site.resume}
            className="inline-flex items-center gap-2 px-2 py-2.5 font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-fg"
          >
            Résumé ↓
          </a>
        </div>

        {/* Telemetry trace */}
        <div className="mt-16 -mx-6 sm:mt-20">
          <svg
            viewBox="0 0 800 80"
            preserveAspectRatio="none"
            className="h-20 w-full sm:h-28"
            role="img"
            aria-label="Decorative memory-pressure trace converging to a steady state"
          >
            <line
              data-hero-baseline
              x1="0"
              y1="50"
              x2="800"
              y2="50"
              stroke="var(--color-line-hi)"
              strokeWidth="1"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
              data-reveal
              className="opacity-0"
            />
            <path
              data-hero-trace
              d={TRACE}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
