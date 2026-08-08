import type { Metadata } from "next";
import Link from "next/link";

import { MoreInstruments } from "@/components/lab-more";
import { RrfLab } from "@/components/lab/rrf-lab";
import { PageHeader, Section } from "@/components/section";
import { getInstrument } from "@/lib/lab";
import { site } from "@/lib/site";

const instrument = getInstrument("rrf-k")!;

const ogImage = `/api/og?title=${encodeURIComponent(
  "What k actually controls in RRF",
)}&subtitle=${encodeURIComponent("Interactive · Retrieval · Lab")}&kind=post`;

export const metadata: Metadata = {
  title: instrument.title,
  description: instrument.summary,
  alternates: { canonical: "/lab/rrf-k" },
  openGraph: {
    type: "article",
    title: instrument.title,
    description: instrument.summary,
    url: `${site.url}/lab/rrf-k`,
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: [ogImage] },
};

/** Marked up as a LearningResource so it can surface as its own result rather
 *  than as an unlabelled page under the blog. */
const schema = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: instrument.title,
  description: instrument.summary,
  url: `${site.url}/lab/rrf-k`,
  learningResourceType: "Interactive explainer",
  educationalLevel: "Professional",
  isAccessibleForFree: true,
  teaches: "How the k constant in Reciprocal Rank Fusion trades retriever confidence against consensus",
  author: { "@type": "Person", name: site.name, url: site.url },
};

export default function RrfLabPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHeader
        eyebrow="Lab · Retrieval"
        title="What k actually controls"
        lead="Reciprocal Rank Fusion is two lines in every hybrid retrieval tutorial, and k = 60 is copied into Elastic, Qdrant, Weaviate, and LangChain without comment. Drag it and see what you inherited."
      />

      <Section className="pb-8">
        <RrfLab />
      </Section>

      <Section className="pt-0 pb-16">
        <div className="prose max-w-2xl">
          <h2>How to read it</h2>
          <p>
            RRF throws away both retrievers&rsquo; scores and keeps only the ordering, then
            sums <code>1 / (k + rank)</code> across retrievers. Ranks are the one thing every
            retriever produces on a comparable scale — rank 1 means the same thing out of BM25
            as it does out of FAISS, in a way that <code>0.83</code> and <code>14.2</code> never
            will.
          </p>
          <p>
            <strong>k sets how sharply rank position is discounted.</strong> At small k, a
            document ranked first is worth far more than one ranked tenth, so a single confident
            retriever can carry a result through fusion alone. At large k, the top ten ranks
            become nearly indistinguishable and what wins instead is agreement between
            retrievers. The <em>rank 1 : rank 10</em> readout is that spread, live.
          </p>
          <p>
            So <code>k = 60</code> is not a neutral default. It is a strong prior toward
            consensus — usually right, and exactly wrong when one of your retrievers is
            categorically better for a query type. The <em>Exact citation</em> scenario is that
            case: BM25 is not merely better at a statutory reference, it is correct, and
            consensus-weighting dilutes it.
          </p>

          <h2>What to do with it</h2>
          <p>
            Sweep k on your own corpus rather than inheriting 60 from a paper written on a
            different one, and fix retrieval depth per retriever — documents outside a
            retriever&rsquo;s top-n contribute nothing, so cutting BM25 at 20 instead of 100
            changes fused results in ways that look like a ranking bug rather than a truncation
            artefact.
          </p>

          <p>
            {instrument.post ? (
              <>
                The full argument, including where RRF fails and how to evaluate it honestly,
                is in{" "}
                <Link href={`/blog/${instrument.post}`}>
                  Reciprocal Rank Fusion in practice
                </Link>
                .
              </>
            ) : null}{" "}
            The scenarios here are constructed to isolate one behaviour each — they are
            illustrations, not benchmark results.
          </p>
        </div>
      </Section>

      <MoreInstruments current="rrf-k" />
    </>
  );
}
