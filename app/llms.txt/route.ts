import { getPosts, getProjects } from "@/lib/content";
import { instruments } from "@/lib/lab";
import { site } from "@/lib/site";

/**
 * llms.txt — a structured summary for language models that crawl the site.
 * Generated from the same content source as the pages, so it can't drift.
 */
export function GET() {
  const projects = getProjects();
  const posts = getPosts().filter((post) => !post.draft);

  const body = `# ${site.name}

> ${site.description}

${site.role} based in ${site.location}. B.Tech Computer Science and Engineering
at Vellore Institute of Technology, Chennai (2024–2028).

The work centres on three questions: what a system should keep (memory), how it
finds what it doesn't have (retrieval), and how it recognises that it has
stopped making progress (stopping).

## Work

${projects
  .map(
    (p) =>
      `- [${p.title}](${site.url}/work/${p.slug}): ${p.subtitle}. ${p.summary.replace(/\s+/g, " ").trim()}`,
  )
  .join("\n")}

## Writing

${
  posts.length > 0
    ? posts
        .map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.description}`)
        .join("\n")
    : "- No published posts yet."
}

## Lab — interactive explainers

Free, no signup. Each one makes a single mechanism draggable.

${instruments
  .map((i) => `- [${i.title}](${site.url}/lab/${i.slug}): ${i.summary.replace(/\s+/g, " ").trim()}`)
  .join("\n")}

## Contact

- Email: ${site.email}
- GitHub: ${site.socials.github}
- LinkedIn: ${site.socials.linkedin}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
