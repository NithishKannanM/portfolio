import Link from "next/link";

import type { Post } from "@/lib/content";
import { formatDate, isoDate } from "@/lib/utils";

export function PostRow({ post }: { post: Post }) {
  return (
    <li className="group relative border-b border-line">
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

        <h3 className="mt-3 text-xl font-semibold tracking-tight transition-colors group-hover:text-signal">
          {post.title}
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">{post.description}</p>

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
    </li>
  );
}
