import type { Metadata } from "next";

import { Panel } from "@/components/panel";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { PageHeader, Section, SectionHeading } from "@/components/section";
import { achievements, certifications, education, experience, skillGroups } from "@/lib/resume";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Computer science undergraduate at VIT Chennai building AI systems for memory, retrieval, and agent reliability.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="I work on the parts of AI systems that fail quietly"
      />

      <Section className="pt-12">
        {/* priority: first content on the page, so an LCP candidate. */}
        <Reveal priority className="max-w-2xl space-y-5 text-base leading-relaxed text-dim">
          <p>
            I&rsquo;m a computer science undergraduate at VIT Chennai. Most of what I
            build sits below the model rather than around it — retrieval, memory,
            and the control logic that decides what a system does when it isn&rsquo;t
            confident.
          </p>
          <p>
            That focus wasn&rsquo;t deliberate at first. It came from noticing that the
            failures which actually hurt are rarely the loud ones. A model that
            crashes gets fixed. A retriever that returns plausible-but-wrong context,
            or an agent that loops politely for forty steps without learning anything,
            keeps running and keeps looking fine.
          </p>
          <p>
            So the work tends toward systems that know their own limits: retrieval
            that fuses signals instead of betting on one, memory that preserves
            history instead of overwriting it, and breakers that trip when progress
            stops rather than when output stops.
          </p>
          <p>
            I care about resource constraints for the same reason. A model that
            assumes infinite memory is a model that hasn&rsquo;t met a phone.
          </p>
        </Reveal>
      </Section>

      {/* --------------------------------------------------------------- */}
      <Section className="py-12">
        <SectionHeading index="01" title="Education" />
        <Reveal>
          <Panel corners className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h3 className="text-base font-medium tracking-tight">{education.school}</h3>
              <span className="label">{education.period}</span>
            </div>
            <p className="mt-2 text-sm text-dim">{education.degree}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <span className="font-mono text-xs text-signal tabular-nums">
                CGPA {education.cgpa}
              </span>
              <span className="font-mono text-xs text-muted">{education.note}</span>
            </div>
          </Panel>
        </Reveal>
      </Section>

      {/* --------------------------------------------------------------- */}
      <Section className="py-12">
        <SectionHeading index="02" title="Experience" />
        <RevealGroup as="ul" className="border-t border-line" gap={0.05}>
          {experience.map((job) => (
            <RevealItem
              as="li"
              key={`${job.org}-${job.role}`}
              className="grid gap-4 border-b border-line py-7 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-8"
            >
              <p className="label">{job.period}</p>
              <div>
                <h3 className="text-base font-medium tracking-tight">{job.role}</h3>
                <p className="mt-0.5 font-mono text-xs text-signal">{job.org}</p>
                <ul className="mt-3 space-y-2">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="relative pl-4 text-sm leading-relaxed text-dim before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-line-hi"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* --------------------------------------------------------------- */}
      <Section className="py-12">
        <SectionHeading index="03" title="Technical skills" />
        <RevealGroup className="grid gap-px border border-line bg-line sm:grid-cols-2" gap={0.05}>
          {skillGroups.map((group) => (
            <RevealItem key={group.label} className="bg-panel p-6">
              <p className="label mb-4">{group.label}</p>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border border-line px-2 py-1 font-mono text-[11px] text-dim"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* --------------------------------------------------------------- */}
      <Section className="py-12 pb-28">
        <SectionHeading index="04" title="Certifications & achievements" />
        <RevealGroup as="ul" className="border-t border-line" gap={0.04}>
          {[...certifications, ...achievements].map((item) => (
            <RevealItem
              as="li"
              key={item.title}
              className="grid gap-2 border-b border-line py-6 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-8"
            >
              <div>
                <h3 className="text-sm font-medium tracking-tight">{item.title}</h3>
                {"issuer" in item ? (
                  <p className="mt-0.5 font-mono text-xs text-signal">{item.issuer}</p>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed text-dim">{item.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-12">
          <a
            href={site.resume}
            className="inline-flex items-center gap-2 border border-line-hi px-5 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors hover:border-signal hover:text-signal"
          >
            Download résumé ↓
          </a>
        </Reveal>
      </Section>
    </>
  );
}
