import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EvidenceBadge } from "@/components/evidence";
import { Mdx } from "@/components/mdx";
import { Toc } from "@/components/toc";
import { getAdjacentPosts, getHeadings, getPost, getPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { formatDate, isoDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(
    post.tags.join(" · "),
  )}&kind=post`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    // Drafts are dev-only, but belt-and-braces in case one ever ships.
    robots: post.draft ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${slug}`,
      publishedTime: isoDate(post.date),
      modifiedTime: post.updated ? isoDate(post.updated) : undefined,
      authors: [site.name],
      tags: [...post.tags],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings = getHeadings(post.body);
  const { newer, older } = getAdjacentPosts(slug);

  return (
    <article>
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-6 pt-12 pb-12">
          <Link href="/blog" className="label inline-block transition-colors hover:text-signal">
            ← All writing
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            <time dateTime={isoDate(post.date)} className="label">
              {formatDate(post.date)}
            </time>
            <span className="label">{post.readingMinutes} min read</span>
            {post.updated ? (
              <span className="label">Updated {formatDate(post.updated)}</span>
            ) : null}
            {post.draft ? (
              <span className="border border-signal-dim px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase text-signal">
                Draft
              </span>
            ) : null}
            <EvidenceBadge
              evidence={post.evidence}
              supersededBy={post.supersededBy}
              detail
            />
          </div>

          <h1 className="mt-5 max-w-3xl text-[clamp(1.875rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
            {post.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-dim">{post.description}</p>

          {post.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-1.5">
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
        </div>
      </header>

      {post.draft ? (
        <div className="border-b border-signal-dim bg-signal/5">
          <p className="mx-auto w-full max-w-6xl px-6 py-3 font-mono text-xs text-signal">
            Draft — technical claims not yet verified by the author. Not published.
          </p>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <Mdx source={post.body} />

          <aside className="order-first lg:order-last">
            <Toc headings={headings} />
          </aside>
        </div>

        {/* Prev / next */}
        {newer || older ? (
          <nav
            aria-label="More posts"
            className="mt-20 grid gap-px border border-line bg-line sm:grid-cols-2"
          >
            {older ? (
              <Link href={`/blog/${older.slug}`} className="group bg-panel p-6">
                <p className="label mb-2">← Older</p>
                <p className="text-sm font-medium transition-colors group-hover:text-signal">
                  {older.title}
                </p>
              </Link>
            ) : (
              <div className="bg-panel" />
            )}
            {newer ? (
              <Link href={`/blog/${newer.slug}`} className="group bg-panel p-6 sm:text-right">
                <p className="label mb-2">Newer →</p>
                <p className="text-sm font-medium transition-colors group-hover:text-signal">
                  {newer.title}
                </p>
              </Link>
            ) : (
              <div className="bg-panel" />
            )}
          </nav>
        ) : null}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: isoDate(post.date),
            dateModified: isoDate(post.updated ?? post.date),
            author: { "@type": "Person", name: site.name, url: site.url },
            keywords: post.tags.join(", "),
            mainEntityOfPage: `${site.url}/blog/${slug}`,
          }),
        }}
      />
    </article>
  );
}
