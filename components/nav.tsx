"use client";

import { AnimatePresence, m, useReducedMotion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the sheet on navigation. Adjusting state during render rather than
  // in an effect — this is the pattern React recommends for deriving state
  // from a changed prop, and it avoids a cascading re-render.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Lock scroll behind the open sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur-md">
      <ScrollRail />

      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.16em] uppercase transition-colors hover:text-signal"
        >
          {site.name}
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative font-mono text-xs tracking-[0.14em] uppercase transition-colors",
                  isActive(item.href) ? "text-signal" : "text-dim hover:text-fg",
                )}
              >
                {item.label}
                {isActive(item.href) ? (
                  <span
                    className="absolute -bottom-[18px] left-0 h-px w-full bg-signal"
                    aria-hidden
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 flex h-9 w-9 items-center justify-center md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="relative block h-3 w-4" aria-hidden>
            <span
              className={cn(
                "absolute left-0 block h-px w-4 bg-fg transition-transform duration-200",
                open ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 block h-px w-4 bg-fg transition-opacity duration-200",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-px w-4 bg-fg transition-transform duration-200",
                open ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </nav>

      <MobileSheet open={open} isActive={isActive} />
    </header>
  );
}

function MobileSheet({
  open,
  isActive,
}: {
  open: boolean;
  isActive: (href: string) => boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          id="mobile-nav"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-line bg-void md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-6 py-4">
            {site.nav.map((item) => (
              <li key={item.href} className="border-b border-line last:border-0">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block py-3.5 font-mono text-xs tracking-[0.14em] uppercase",
                    isActive(item.href) ? "text-signal" : "text-dim",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Reading-progress hairline pinned to the bottom edge of the header. */
function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 36,
    restDelta: 0.001,
  });

  return (
    <m.div
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-signal"
      aria-hidden
    />
  );
}
