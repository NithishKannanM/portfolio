"use client";

import { useEffect, useState, type RefObject } from "react";

import { revealOffset } from "./motion";

/**
 * Scroll-reveal trigger.
 *
 * Deliberately *not* IntersectionObserver. An observer only delivers a callback
 * when a threshold is crossed, and an element that goes from fully below the
 * viewport to fully above it in a single frame — a flung trackpad, a jump to an
 * anchor — crosses nothing: its ratio reads 0 both times. Paired with a
 * fire-once reveal, that element stays at opacity 0 for the rest of the page's
 * life. Every route on this site reproduced it.
 *
 * The check here is a plain geometric one: has the trigger line passed the
 * element's top edge? That is monotone under downward scrolling, so it holds
 * however far the viewport moved between two samples — there is no gap to fall
 * through.
 */

/**
 * One shared scroll pass for every pending element. Each is checked at most
 * once per scrolled frame and drops out the moment it fires, so the work shrinks
 * to nothing as the page settles — and the listeners come off entirely once the
 * last one has revealed.
 */
const pending = new Set<() => void>();
let frame = 0;
let listening = false;

function flush() {
  frame = 0;
  // Deleting from a Set mid-iteration is well-defined; a check that fires
  // removes itself without disturbing the rest of this pass.
  for (const check of pending) check();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function unlistenIfIdle() {
  if (!listening || pending.size > 0) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

/**
 * Returns true once `ref`'s element has reached the trigger line, and stays
 * true — reveals settle, they don't replay.
 */
export function useReveal(ref: RefObject<Element | null>): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    const check = () => {
      if (el.getBoundingClientRect().top >= window.innerHeight - revealOffset) return;
      pending.delete(check);
      unlistenIfIdle();
      setRevealed(true);
    };

    pending.add(check);
    listen();
    // Anything already past the line on mount reveals without waiting for a
    // scroll that may never come on a short page.
    check();

    return () => {
      pending.delete(check);
      unlistenIfIdle();
    };
  }, [ref, revealed]);

  return revealed;
}
