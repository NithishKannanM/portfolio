import type { MetadataRoute } from "next";

import { getPosts, getProjects } from "@/lib/content";
import { instruments } from "@/lib/lab";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/blog", "/lab", "/about", "/contact"].map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Interactive explainers are the pages most likely to be linked from
  // elsewhere, so they carry a higher priority than posts.
  const lab = instruments.map((instrument) => ({
    url: `${site.url}/lab/${instrument.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projects = getProjects().map((project) => ({
    url: `${site.url}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // getPosts() already drops drafts outside development.
  const posts = getPosts()
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...lab, ...projects, ...posts];
}
