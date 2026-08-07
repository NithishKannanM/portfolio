/**
 * The lab index. Each instrument is a self-contained interactive explainer for
 * one mechanism, reachable at /lab/<slug> and embeddable in the post it came
 * out of. Registered here so the index page, the sitemap, and llms.txt all
 * agree on what exists.
 */
export type Instrument = {
  slug: string;
  title: string;
  /** Shown on the index and used as the page description. */
  summary: string;
  /** The question it answers, in the visitor's words. */
  answers: string;
  /** The post it belongs to, if any. */
  post?: string;
};

export const instruments: Instrument[] = [
  {
    slug: "rrf-k",
    title: "What k actually controls in Reciprocal Rank Fusion",
    summary:
      "Every hybrid search stack ships k = 60 and almost nobody can say what it does to their rankings. Drag k across two real ranked lists and watch the fused ordering reorder — including the point where the top result flips.",
    answers: "Answers: why k = 60, and when it is wrong for you",
    post: "reciprocal-rank-fusion-in-practice",
  },
];

export const getInstrument = (slug: string) => instruments.find((i) => i.slug === slug);
