import Link from "next/link";

import { Hero } from "@/components/hero";
import { Panel } from "@/components/panel";
import { ProjectPanel, ProjectRow } from "@/components/project-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section";
import { getFeaturedProjects, getPosts, getProjects } from "@/lib/content";
import { experience, thesis } from "@/lib/resume";
import { site } from "@/lib/site";
import { formatDate, isoDate } from "@/lib/utils";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const other = getProjects().filter((p) => !p.featured);
  const posts = getPosts().slice(0, 3);

  return (
    <>
      <Hero />

      {/* ---------------------------------------------------------------
          The thesis. Three channels the whole body of work runs through.
          --------------------------------------------------------------- */}
      <Section id="thesis">
        <SectionHeading index="01" title="What I work on" />
        <RevealGroup className="grid gap-px border border-line bg-line md:grid-cols-3" gap={0.06}>
          {thesis.map((channel) => (
            <RevealItem key={channel.id} className="bg-panel p-6">
              <h3 className="text-base font-semibold tracking-tight text-signal">
                {channel.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">{channel.body}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {channel.projects.map((name) => (
                  <li
                    key={name}
                    className="border border-line px-2 py-1 font-mono text-[10px] text-muted"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* --------------------------------------------------------------- */}
      <Section id="work">
        <SectionHeading
          index="02"
          title="Selected work"
          aside={
            <Link
              href="/work"
              className="font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-signal"
            >
              All work →
            </Link>
          }
        />

        <RevealGroup className="grid gap-5 lg:grid-cols-2" gap={0.07}>
          {featured.map((project) => (
            <RevealItem key={project.slug} className="relative">
              <ProjectPanel project={project} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>

        {other.length > 0 ? (
          <Reveal className="mt-16">
            <h3 className="label mb-2">Also shipped</h3>
            <ul>
              {other.map((project) => (
                <ProjectRow key={project.slug} project={project} />
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Section>

      {/* --------------------------------------------------------------- */}
      <Section id="experience">
        <SectionHeading index="03" title="Experience" />
        <RevealGroup as="ul" className="border-t border-line" gap={0.05}>
          {experience.map((job) => (
            <RevealItem
              as="li"
              key={`${job.org}-${job.role}`}
              className="grid gap-4 border-b border-line py-7 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-8"
            >
              <div>
                <p className="label">{job.period}</p>
              </div>
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
      {posts.length > 0 ? (
        <Section id="writing">
          <SectionHeading
            index="04"
            title="Writing"
            aside={
              <Link
                href="/blog"
                className="font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-signal"
              >
                All posts →
              </Link>
            }
          />
          <RevealGroup as="ul" className="border-t border-line" gap={0.05}>
            {posts.map((post) => (
              <RevealItem as="li" key={post.slug} className="group border-b border-line">
                <Link href={`/blog/${post.slug}`} className="block py-6">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <time dateTime={isoDate(post.date)} className="label">
                      {formatDate(post.date)}
                    </time>
                    <span className="label">{post.readingMinutes} min</span>
                    {post.draft ? (
                      <span className="border border-signal-dim px-1.5 py-0.5 font-mono text-[10px] uppercase text-signal">
                        Draft
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-base font-medium tracking-tight transition-colors group-hover:text-signal">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-dim">
                    {post.description}
                  </p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      ) : null}

      {/* --------------------------------------------------------------- */}
      <Section id="contact" className="pb-28">
        <Reveal>
          <Panel corners className="p-8 sm:p-12">
            <p className="label mb-5">Get in touch</p>
            <p className="max-w-xl text-xl leading-snug tracking-tight sm:text-2xl">
              Open to internships, research collaboration, and conversations about
              memory and retrieval systems.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-line-hi px-5 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors hover:border-signal hover:text-signal"
              >
                Contact →
              </Link>
              <a
                href={`mailto:${site.email}`}
                className="font-mono text-xs text-dim transition-colors hover:text-signal"
              >
                {site.email}
              </a>
              <a
                href={site.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-dim transition-colors hover:text-signal"
              >
                GitHub
              </a>
            </div>
          </Panel>
        </Reveal>
      </Section>
    </>
  );
}
