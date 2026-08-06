import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { PageHeader, Section } from "@/components/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — internships, research collaboration, and conversations about memory and retrieval systems.`,
  alternates: { canonical: "/contact" },
};

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "GitHub", value: "github.com/NithishKannanM", href: site.socials.github },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/nithish-kannan-m",
    href: site.socials.linkedin,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        lead="Open to internships, research collaboration, and conversations about memory and retrieval systems. I read everything that arrives here."
      />

      <Section className="pb-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr]">
          <Reveal>
            <p className="label mb-6">Direct</p>
            <ul className="border-t border-line">
              {channels.map((channel) => (
                <li key={channel.label} className="border-b border-line py-5">
                  <p className="label mb-2">{channel.label}</p>
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-mono text-sm text-fg transition-colors hover:text-signal"
                  >
                    {channel.value}
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-8 font-mono text-xs leading-relaxed text-muted">
              Based in {site.location}. IST (UTC+5:30).
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <p className="label mb-6">Send a message</p>
            <ContactForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
