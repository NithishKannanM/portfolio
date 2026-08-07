"use client";

import Link from "next/link";

import { HeroTrace } from "@/components/hero-trace";
import { site } from "@/lib/site";

/**
 * The text entrance is CSS (see [data-hero-rise] in globals.css) so it paints
 * without waiting for this script — the thesis paragraph is the page's LCP
 * element and gating it on hydration cost seconds.
 *
 * The telemetry trace owns its own timeline and scroll loop; see
 * components/hero-trace.tsx.
 */
export function Hero() {
  const words = site.name.split(" ");

  return (
    <section
      className="relative overflow-hidden border-b border-line"
      aria-labelledby="hero-name"
    >
      <div className="pointer-events-none absolute inset-0 grid-field opacity-60" aria-hidden />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-0 sm:pt-28">
        {/* Status line */}
        <div
          data-hero-rise
          className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <span className="label flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            {site.location}
          </span>
          <span className="label">B.Tech CSE · VIT Chennai</span>
        </div>

        <div
          data-hero-wipe
          style={{ "--delay": "80ms" } as React.CSSProperties}
          className="mb-10 h-px bg-line"
          aria-hidden
        />

        {/* Name */}
        <h1
          id="hero-name"
          className="text-[clamp(2.75rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]"
        >
          {words.map((word, i) => (
            <span key={word} className="inline-block overflow-hidden align-bottom">
              <span
                data-hero-rise
                style={{ "--delay": `${120 + i * 70}ms` } as React.CSSProperties}
                className="inline-block"
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h1>

        {/* Thesis — deliberately not animated. This is the page's LCP element,
            and any entrance animation on it (even a pure-CSS one) defers the
            LCP paint by the animation delay plus, under CPU throttling, a good
            deal more. It reads fine arriving with the page. */}
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-dim sm:text-xl">
          I build AI systems that <span className="text-fg">remember</span>,{" "}
          <span className="text-fg">retrieve</span>, and{" "}
          <span className="text-fg">know when to stop</span> — hybrid retrieval,
          predictive memory orchestration, and reliability for agent loops.
        </p>

        {/* Actions */}
        <div
          data-hero-rise
          style={{ "--delay": "340ms" } as React.CSSProperties}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
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
        <HeroTrace />
      </div>
    </section>
  );
}
