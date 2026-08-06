"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { ease } from "@/lib/motion";
import { cn, formatDate, isoDate } from "@/lib/utils";

/** Body is stripped before this crosses the server boundary. */
export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
};

type Tag = { tag: string; count: number };

const TAG_CHANGE = "blogtagchange";

/**
 * The URL is the external store for the active tag.
 *
 * Deliberately not `useSearchParams`, which would push the whole /blog route
 * into dynamic rendering — or, behind a Suspense boundary, emit the post list
 * into the HTML twice. The server snapshot is null, so the prerendered page
 * lists every post and React reconciles to the filtered view on hydration:
 * no mismatch, and the back button works for free.
 */
function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(TAG_CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(TAG_CHANGE, onChange);
  };
}

const getTagFromUrl = () => new URLSearchParams(window.location.search).get("tag");
const getServerTag = () => null;

/**
 * All posts are present in the server-rendered HTML — filtering is a client
 * view concern, so crawlers and no-JS visitors still see every post.
 */
export function BlogIndex({ posts, tags }: { posts: PostSummary[]; tags: Tag[] }) {
  const reduce = useReducedMotion();
  const urlTag = useSyncExternalStore(subscribeToUrl, getTagFromUrl, getServerTag);

  // Ignore a ?tag= that doesn't exist rather than showing an empty list.
  const active = urlTag && tags.some((t) => t.tag === urlTag) ? urlTag : null;

  // `replaceState` rather than push so a run of chip clicks doesn't fill the
  // history stack, and rather than router.replace so changing a client-side
  // filter never refetches an RSC payload.
  function onSelect(tag: string | null) {
    const url = tag ? `?tag=${encodeURIComponent(tag)}` : window.location.pathname;
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(TAG_CHANGE));
  }

  const visible = useMemo(
    () => (active ? posts.filter((p) => p.tags.includes(active)) : posts),
    [posts, active],
  );

  return (
    <>
      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-6">
          <FilterChip active={active === null} onClick={() => onSelect(null)}>
            All <span className="opacity-60">{posts.length}</span>
          </FilterChip>
          {tags.map(({ tag, count }) => (
            <FilterChip
              key={tag}
              active={active === tag}
              onClick={() => onSelect(active === tag ? null : tag)}
            >
              {tag} <span className="opacity-60">{count}</span>
            </FilterChip>
          ))}
        </div>
      ) : null}

      <ul aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((post) => (
            <m.li
              key={post.slug}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.22, ease }}
              className="group relative border-b border-line"
            >
              <Link href={`/blog/${post.slug}`} className="block py-7">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <time dateTime={isoDate(post.date)} className="label">
                    {formatDate(post.date)}
                  </time>
                  <span className="label text-line-hi" aria-hidden>
                    ·
                  </span>
                  <span className="label">{post.readingMinutes} min</span>
                  {post.draft ? (
                    <span className="border border-signal-dim px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase text-signal">
                      Draft
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight transition-colors group-hover:text-signal">
                  {post.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
                  {post.description}
                </p>

                {post.tags.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border border-line px-2 py-1 font-mono text-[10px] tracking-wide text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Link>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>

      {visible.length === 0 ? (
        <p className="py-16 text-center font-mono text-xs text-muted">
          No posts tagged “{active}”.
        </p>
      ) : null}
    </>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-2.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors",
        active
          ? "border-signal text-signal"
          : "border-line text-muted hover:border-line-hi hover:text-dim",
      )}
    >
      {children}
    </button>
  );
}
