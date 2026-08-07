"use client";

import { createDrawable, createTimeline } from "animejs";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * A live memory-pressure trace.
 *
 * The visitor is the workload. Scrolling drives `load` up; the trace goes
 * bursty and samples scroll leftward off the edge. Stop scrolling and load
 * bleeds away, the excursions shrink, and the line converges onto the dashed
 * baseline — at which point the loop cancels itself rather than idling. That
 * last part is the whole point: this is a portfolio about systems that know
 * when to stop, so the instrument on its front page stops.
 *
 * Deliberately not decorative noise — it's the shape of the problem the work
 * is about, driven by real input rather than replayed from a constant.
 */

const VIEW_W = 800;
const BASELINE = 50; // y of the settled state, matching the dashed guide line
const TOP = 6;
const BOTTOM = 74;

/** Points drawn across the full width. The buffer carries two more so the
 *  waveform can slide a whole step before the samples shift. */
const VISIBLE = 24;
const BUFFER = VISIBLE + 2;
const STEP = VIEW_W / (VISIBLE - 1);

const SAMPLE_MS = 45; // ~1.2s of history across the width
const LOAD_DECAY_MS = 420; // exponential half-life of a scroll burst
const SCROLL_SATURATION = 900; // px of scrolling that pins load at 1
const REST_EPSILON = 0.4; // how flat counts as converged

/** An idle instrument shouldn't shout. At rest the trace dims to a quiet rule
 *  resting on the dashed guide; under signal it comes up to full amber. */
const REST_OPACITY = 0.3;
const OPACITY_LERP_MS = 120;

/** The hand-tuned silhouette the hero has always opened on: noisy on the left,
 *  settled on the right. Read right-to-left it is exactly the history a live
 *  chart would show — a system that was under pressure and has since calmed —
 *  so it doubles as the seed state for the rolling buffer. */
const SEED_SHAPE = [
  62, 58, 64, 42, 57, 18, 54, 34, 66, 26, 60, 10, 48, 40, 55, 46, 51, 49, 50, 50, 50,
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Linear resample, so the seed keeps its shape at whatever BUFFER we use. */
function resample(src: number[], count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / (count - 1)) * (src.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(src.length - 1, lo + 1);
    return src[lo] + (src[hi] - src[lo]) * (t - lo);
  });
}

const SEED = resample(SEED_SHAPE, BUFFER);

/** `phase` is the fractional sample the buffer has slid by, which turns the
 *  once-per-SAMPLE_MS shift into a continuous glide. */
function toPath(samples: number[], phase: number): string {
  let d = "";
  for (let i = 0; i < samples.length; i++) {
    const x = (i - 1 - phase) * STEP;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${samples[i].toFixed(1)} `;
  }
  return d.trimEnd();
}

/** Biasing the uniform keeps large excursions in the minority, so the trace
 *  reads as bursty rather than uniformly fuzzy — but not so rare that a short
 *  flick produces nothing. Spikes go up; pressure rises. */
function nextSample(load: number): number {
  const spike = Math.random() ** 1.7 * 46 * load;
  const jitter = (Math.random() - 0.5) * 8 * load;
  return clamp(BASELINE - spike + jitter, TOP, BOTTOM);
}

export function HeroTrace() {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const path = svg.querySelector<SVGPathElement>("[data-hero-trace]");
    if (!path) return;

    const samples = [...SEED];
    let raf = 0;
    let last = 0;
    let phase = 0;
    let load = 0;
    let opacity = 1;
    let visible = true;
    let live = false;

    const converged = () =>
      load < 0.004 && samples.every((y) => Math.abs(y - BASELINE) < REST_EPSILON);

    /** Brightness follows whichever is louder: the load being applied now, or
     *  the excursions still on screen. Keying it to both means the seeded
     *  history stays lit as it scrolls off instead of snapping dim at handoff. */
    const activity = () => {
      const peak = samples.reduce((m, y) => Math.max(m, Math.abs(y - BASELINE)), 0);
      return clamp(Math.max(load, peak / 44), 0, 1);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const frame = (now: number) => {
      // Cap dt so returning to a backgrounded tab doesn't lurch the buffer
      // forward by thousands of samples.
      const dt = Math.min(64, now - last);
      last = now;

      load *= Math.exp(-dt / LOAD_DECAY_MS);
      phase += dt / SAMPLE_MS;
      while (phase >= 1) {
        phase -= 1;
        samples.shift();
        samples.push(nextSample(load));
      }

      const target = REST_OPACITY + (1 - REST_OPACITY) * activity();
      opacity += (target - opacity) * (1 - Math.exp(-dt / OPACITY_LERP_MS));

      if (converged() && Math.abs(opacity - REST_OPACITY) < 0.01) {
        samples.fill(BASELINE);
        path.setAttribute("d", toPath(samples, 0));
        path.style.opacity = String(REST_OPACITY);
        raf = 0; // settled — nothing to draw until the next scroll
        return;
      }

      path.setAttribute("d", toPath(samples, phase));
      path.style.opacity = opacity.toFixed(3);
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !visible || !live) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      load = Math.min(1, load + Math.abs(y - lastY) / SCROLL_SATURATION);
      lastY = y;
      wake();
    };

    // Purely an off-switch for work the visitor cannot see. Unlike a reveal
    // trigger, a missed edge here costs at most a few idle frames.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
        else stop();
      },
      { rootMargin: "100px" },
    );
    io.observe(svg);

    const tl = createTimeline({
      defaults: { ease: "outExpo" },
      onComplete: () => {
        if (reduce) return;
        // The drawable leaves dash values sized to the path it just drew;
        // they would clip the line the moment `d` starts changing.
        path.style.strokeDasharray = "";
        path.style.strokeDashoffset = "";
        path.removeAttribute("stroke-dasharray");
        path.removeAttribute("stroke-dashoffset");

        live = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        // The seeded history is still on screen — let it scroll off and settle.
        wake();
      },
    })
      .add(
        createDrawable(svg.querySelectorAll("[data-hero-trace]")),
        { draw: ["0 0", "0 1"], duration: 1400 },
        0,
      )
      .add(svg.querySelectorAll("[data-hero-baseline]"), { opacity: [0, 1], duration: 400 }, 500);

    if (reduce) tl.complete();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      tl.revert();
    };
  }, [reduce]);

  return (
    <div className="mt-16 -mx-6 sm:mt-20">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} 80`}
        preserveAspectRatio="none"
        className="h-20 w-full sm:h-28"
        role="img"
        aria-label="Decorative memory-pressure trace: it grows noisy while you scroll and settles to a flat line when you stop"
      >
        <line
          data-hero-baseline
          data-reveal
          x1="0"
          y1={BASELINE}
          x2={VIEW_W}
          y2={BASELINE}
          stroke="var(--color-line-hi)"
          strokeWidth="1"
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          data-hero-trace
          d={toPath(SEED, 0)}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
