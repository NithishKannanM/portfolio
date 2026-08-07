import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { PageHeader, Section } from "@/components/section";
import { instruments } from "@/lib/lab";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Interactive explainers for retrieval and memory-system internals — free to use, no signup. Built from the systems described in the writing.",
  alternates: { canonical: "/lab" },
  openGraph: {
    type: "website",
    title: `Lab — ${site.name}`,
    description:
      "Interactive explainers for retrieval and memory-system internals. Free to use, no signup.",
    url: `${site.url}/lab`,
  },
};

export default function LabPage() {
  return (
    <>
      <PageHeader
        eyebrow="Lab"
        title="Instruments you can drag"
        lead="Mechanisms I had to understand properly to build the systems in Work — rebuilt as things you can poke at. Free, no signup, no email gate. If one of them saves you an afternoon, it did its job."
      />

      <Section className="pb-28">
        <ul className="border-t border-line">
          {instruments.map((instrument) => (
            <Reveal as="li" key={instrument.slug}>
              <Link
                href={`/lab/${instrument.slug}`}
                className="group grid gap-3 border-b border-line py-8 transition-colors hover:bg-panel sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-signal">
                    {instrument.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
                    {instrument.summary}
                  </p>
                  <p className="label mt-3">{instrument.answers}</p>
                </div>
                <span
                  className="font-mono text-xs tracking-wider text-muted uppercase transition-colors group-hover:text-signal"
                  aria-hidden
                >
                  Open →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>
    </>
  );
}
