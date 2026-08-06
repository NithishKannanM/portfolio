import type { Metadata } from "next";

import { BlogIndex, type PostSummary } from "@/components/blog-index";
import { PageHeader, Section } from "@/components/section";
import { getPosts, getTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Technical writing on retrieval fusion, reinforcement learning over Linux memory tiers, and detecting when an AI agent has stopped making progress.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  // Strip the MDX body before it crosses to the client component — the
  // index only needs metadata, and bodies would bloat the RSC payload.
  const posts: PostSummary[] = getPosts().map(({ body: _body, ...meta }) => meta);
  const tags = getTags();

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Notes from building"
        lead="Longer-form write-ups of things I've actually built — what the problem was, what I tried, and where it broke."
      />

      <Section>
        <BlogIndex posts={posts} tags={tags} />
      </Section>
    </>
  );
}
