import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

/**
 * Shiki theme. `github-dark-default` is close to the instrument palette
 * already; globals.css overrides the container chrome so code blocks read
 * as panels rather than floating cards.
 */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: false,
  defaultLang: { block: "text", inline: "text" },
};

export const mdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: { className: ["heading-anchor"], ariaHidden: true, tabIndex: -1 },
        content: { type: "text", value: "#" },
      },
    ],
    rehypeKatex,
    [rehypePrettyCode, prettyCodeOptions],
  ],
} as const;
