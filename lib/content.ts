import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ============================================================
   SCHEMAS
   Frontmatter is validated at read time. A typo in a .mdx file
   should fail the build loudly, not render a blank section.
   ============================================================ */

const metricSchema = z.object({
  label: z.string(),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  /** Comparison point, e.g. the Android App Standby Buckets baseline. */
  baseline: z.union([z.number(), z.string()]).optional(),
  baselineLabel: z.string().optional(),
  /** Which direction counts as an improvement. Drives delta colouring. */
  better: z.enum(["higher", "lower"]).optional(),
  /** 0-1. Drives the bar fill. Omit for figures that aren't proportional. */
  fill: z.number().min(0).max(1).optional(),
  note: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  /** Optional: not every project on the resume carries a date. */
  period: z.string().optional(),
  role: z.string().optional(),
  org: z.string().optional(),
  status: z.enum(["shipped", "active", "research"]),
  stack: z.array(z.string()),
  metrics: z.array(metricSchema).default([]),
  links: z
    .object({
      github: z.string().url().optional(),
      pypi: z.string().url().optional(),
      paper: z.string().url().optional(),
      demo: z.string().url().optional(),
    })
    .default({}),
  summary: z.string(),
  featured: z.boolean().default(false),
  order: z.number().default(99),
});

const postSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /**
     * What backs the claims in the post.
     *
     * Defaults to `reasoned` deliberately: that is the weaker statement, so a
     * post has to opt in to claiming it measured something, never the other
     * way round. `reasoned` is not a lesser post — an argument from having
     * built the thing is worth reading — but a post that argues from numbers
     * should say so and then show them.
     */
    evidence: z.enum(["measured", "reasoned", "superseded"]).default("reasoned"),
    /** Slug of the post that replaces this one. Required when superseded. */
    supersededBy: z.string().optional(),
  })
  .refine((post) => post.evidence !== "superseded" || Boolean(post.supersededBy), {
    message: "a superseded post must name its replacement in `supersededBy`",
    path: ["supersededBy"],
  });

export type Metric = z.infer<typeof metricSchema>;
export type ProjectMeta = z.infer<typeof projectSchema>;
export type PostMeta = z.infer<typeof postSchema>;

export type Project = ProjectMeta & { slug: string; body: string };
export type Post = PostMeta & {
  slug: string;
  body: string;
  readingMinutes: number;
};

/* ============================================================
   READ
   ============================================================ */

function readDir(dir: string) {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      return { slug, data, content, file: `${dir}/${file}` };
    });
}

// Generic over the schema, not its type, so `.default()` output types
// (metrics, tags, order) come through as required rather than optional.
function parse<S extends z.ZodTypeAny>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in content/${file}:\n${result.error.issues
        .map((i) => `  · ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    );
  }
  return result.data;
}

/** Drafts are visible in `next dev` so they can be previewed, and dropped
 *  from production builds, RSS, and the sitemap. */
const showDrafts = process.env.NODE_ENV === "development";

export function getProjects(): Project[] {
  return readDir("projects")
    .map(({ slug, data, content, file }) => ({
      slug,
      body: content,
      ...parse(projectSchema, data, file),
    }))
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getPosts(): Post[] {
  return readDir("blog")
    .map(({ slug, data, content, file }) => {
      const meta = parse(postSchema, data, file);
      return {
        slug,
        body: content,
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
        ...meta,
      };
    })
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

/** All tags, most-used first. Powers the blog index filter. */
export function getTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Chronological neighbours for prev/next links on a post. */
export function getAdjacentPosts(slug: string) {
  const posts = getPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  return {
    newer: i > 0 ? posts[i - 1] : undefined,
    older: i >= 0 && i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

/* ============================================================
   HEADINGS — table of contents
   Parsed from the raw MDX rather than the rendered output so the
   TOC can be built on the server without a DOM. Matches the ids
   that rehype-slug generates.
   ============================================================ */

export type Heading = { id: string; text: string; level: 2 | 3 };

export function getHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const text = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();

    headings.push({
      level: match[1].length as 2 | 3,
      text,
      id: slugify(text),
    });
  }
  return headings;
}

/** Mirrors github-slugger, which is what rehype-slug uses. */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{Zs}-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}
