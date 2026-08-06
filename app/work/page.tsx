import type { Metadata } from "next";

import { ProjectPanel, ProjectRow } from "@/components/project-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { PageHeader, Section } from "@/components/section";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Projects on memory, retrieval, and agent reliability — hybrid-retrieval RAG, predictive memory orchestration, contradiction-aware stores, and semantic circuit breakers.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const projects = getProjects();
  const featured = projects.filter((p) => p.featured);
  const other = projects.filter((p) => !p.featured);

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Memory, retrieval, and knowing when to stop"
        lead="Every project here is some version of the same question: what should a system keep, what should it go and find, and when should it admit it isn't getting anywhere."
      />

      <Section>
        {/* Panels are the primary content under the page h1 here, so they
            carry h2 — unlike on the home page, where a section heading
            already occupies that level. */}
        <h2 className="sr-only">Featured projects</h2>
        {/* priority: this grid is the first content on the page, so its cards
            are LCP candidates and must not wait on hydration to become
            visible. */}
        <RevealGroup className="grid gap-5 lg:grid-cols-2" gap={0.07} priority>
          {featured.map((project) => (
            <RevealItem key={project.slug} className="relative" priority>
              <ProjectPanel project={project} headingLevel="h2" className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>

        {other.length > 0 ? (
          <Reveal className="mt-16">
            <h2 className="label mb-2">Also shipped</h2>
            <ul>
              {other.map((project) => (
                <ProjectRow key={project.slug} project={project} headingLevel="h3" />
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Section>
    </>
  );
}
