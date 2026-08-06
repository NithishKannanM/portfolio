import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Mdx } from "@/components/mdx";
import { MetricStrip, StatusDot } from "@/components/metric";
import { getProject, getProjects } from "@/lib/content";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — ${project.subtitle}`;
  const ogImage = `/api/og?title=${encodeURIComponent(project.title)}&subtitle=${encodeURIComponent(
    project.subtitle,
  )}&kind=work`;

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      title,
      description: project.summary,
      url: `${site.url}/work/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

const linkLabels: Record<string, string> = {
  github: "GitHub",
  pypi: "PyPI",
  paper: "Paper",
  demo: "Demo",
};

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const links = Object.entries(project.links).filter(([, href]) => Boolean(href)) as [
    string,
    string,
  ][];

  return (
    <article>
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-6 pt-12 pb-12">
          <Link
            href="/work"
            className="label inline-block transition-colors hover:text-signal"
          >
            ← All work
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <StatusDot status={project.status} />
            {project.period ? <span className="label">{project.period}</span> : null}
            {project.org ? <span className="label">{project.org}</span> : null}
          </div>

          <h1 className="mt-5 text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.03em]">
            {project.title}
          </h1>
          <p className="mt-3 font-mono text-sm text-signal">{project.subtitle}</p>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-dim">{project.summary}</p>

          {links.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {links.map(([key, href]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-line px-4 py-2 font-mono text-xs tracking-wider uppercase text-dim transition-colors hover:border-signal hover:text-signal"
                >
                  {linkLabels[key] ?? key} ↗
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {project.metrics.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-6">
          <MetricStrip metrics={project.metrics} className="border-t-0" />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <Mdx source={project.body} />

          <aside className="lg:order-last">
            <div className="sticky top-24">
              <p className="label mb-4">Stack</p>
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="border border-line px-2 py-1 font-mono text-[10px] text-muted"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
