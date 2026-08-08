import type { Metadata } from "next";
import Link from "next/link";

import { MoreInstruments } from "@/components/lab-more";
import { PsiLab } from "@/components/lab/psi-lab";
import { PageHeader, Section } from "@/components/section";
import { getInstrument } from "@/lib/lab";
import { site } from "@/lib/site";

const instrument = getInstrument("psi-vs-free-bytes")!;

const ogImage = `/api/og?title=${encodeURIComponent(
  "Why free memory looks fine while the machine thrashes",
)}&subtitle=${encodeURIComponent("Interactive · Systems · Lab")}&kind=post`;

export const metadata: Metadata = {
  title: instrument.title,
  description: instrument.summary,
  alternates: { canonical: "/lab/psi-vs-free-bytes" },
  openGraph: {
    type: "article",
    title: instrument.title,
    description: instrument.summary,
    url: `${site.url}/lab/psi-vs-free-bytes`,
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: [ogImage] },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: instrument.title,
  description: instrument.summary,
  url: `${site.url}/lab/psi-vs-free-bytes`,
  learningResourceType: "Interactive explainer",
  educationalLevel: "Professional",
  isAccessibleForFree: true,
  teaches:
    "Why free-memory thresholds fail to detect memory pressure, and how PSI stall time from cgroup v2 measures it instead",
  author: { "@type": "Person", name: site.name, url: site.url },
};

export default function PsiLabPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHeader
        eyebrow="Lab · Systems"
        title="Free memory looks fine. The machine is thrashing."
        lead="Your alert watches free bytes, and it did not fire during the last incident. That is not a tuning problem. Drag the threshold across three workloads and try to find a value that handles all of them."
      />

      <Section className="pb-8">
        <PsiLab />
      </Section>

      <Section className="pt-0 pb-16">
        <div className="prose max-w-2xl">
          <h2>How to read it</h2>
          <p>
            The shaded band is ground truth: the window in which tasks are actually stalling
            and the user is actually paying for it. It is defined by the harm, not by either
            policy, so neither signal gets to mark its own homework. Each policy draws a
            vertical line where it fires.
          </p>
          <p>
            The <em>refault storm</em> is the case that matters. The working set is slightly
            too large, so the kernel reclaims continuously and immediately reads back the
            pages it just dropped. Free memory sits at a comfortable 280 MB the entire time —
            not despite the thrashing but <strong>because of it</strong>. Reclaim is
            succeeding. That is what a healthy free-memory figure means: the kernel is keeping
            up. It says nothing whatsoever about what keeping up is costing.
          </p>
          <p>
            So raise the threshold until it catches that, and look at <em>healthy churn</em>.
            Free memory swings between 178 and 322 MB there because the page cache is doing
            its job, and the system is never in trouble. Every firing in that panel evicts a
            warm app for nothing and charges the user a cold start when they switch back.
          </p>

          <h2>Why no threshold works</h2>
          <p>
            Free bytes is a <strong>level</strong>. Pressure is a <strong>rate</strong>. A
            level tells you where you ended up; it cannot tell you how hard the machine worked
            to keep you there, and the work is the part that hurts. Two systems reporting an
            identical 280 MB free can be in completely different states — one idle, one
            refaulting its working set several times a second — and no threshold on that
            number can separate them, because the number is the same.
          </p>
          <p>
            Reaching for <code>MemAvailable</code> instead of <code>MemFree</code> does not
            fix this. It is a better estimate, and it is still a level: it predicts how much
            you could reclaim, not what reclaiming is already costing.
          </p>
          <p>
            PSI measures the cost directly. From{" "}
            <code>/proc/pressure/memory</code>, or per-cgroup at{" "}
            <code>/sys/fs/cgroup/&lt;slice&gt;/memory.pressure</code>:
          </p>
          <pre>
            <code>{`some avg10=47.21 avg60=31.08 avg300=12.44 total=8419283
full avg10=11.902 avg60=6.31  avg300=2.07  total=1904772`}</code>
          </pre>
          <p>
            <code>some</code> is the share of the last ten seconds in which{" "}
            <em>at least one</em> runnable task was stalled waiting on memory.{" "}
            <code>full</code> is the share in which <em>every</em> non-idle task was stalled —
            by the time that one is high you are not degraded, you are stopped. Both are wall
            time lost, which is the same quantity the user experiences, and that is why one
            threshold survives all three workloads without retuning.
          </p>

          <h2>What to do with it</h2>
          <p>
            Alert on <code>some avg10</code> for early warning and{" "}
            <code>full avg10</code> for &ldquo;we are already down&rdquo;. Keep the free-bytes
            alert if you like — it is a fine last-resort backstop — but stop treating it as
            the detector. It needs Linux 4.20 or newer, and cgroup v2 for the per-cgroup
            figures.
          </p>
          <p>
            This is not a niche opinion. <code>systemd-oomd</code>, Meta&rsquo;s{" "}
            <code>oomd</code>, and Android&rsquo;s <code>lmkd</code> all moved their kill
            decisions onto PSI rather than free-memory watermarks, for the reason the third
            panel shows: watermark-based killing either fires too late or fires constantly,
            and there is no setting in between.
          </p>

          <p>
            {instrument.post ? (
              <>
                The longer argument — including why this became the observation space for a
                reinforcement-learning memory policy rather than a hand-tuned heuristic — is
                in{" "}
                <Link href={`/blog/${instrument.post}`}>
                  Reinforcement learning over cgroup v2
                </Link>
                .
              </>
            ) : null}{" "}
            The three workloads here are constructed to isolate one behaviour each. They are
            illustrations of a mechanism, not benchmark results.
          </p>
        </div>
      </Section>

      <MoreInstruments current="psi-vs-free-bytes" />
    </>
  );
}
