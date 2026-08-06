import Link from "next/link";

import { site } from "@/lib/site";

const external = [
  { label: "GitHub", href: site.socials.github },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "Email", href: `mailto:${site.email}` },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="label mb-3">Elsewhere</p>
            <ul className="flex flex-col gap-2">
              {external.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-mono text-xs text-dim transition-colors hover:text-signal"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:text-right">
            <p className="label mb-3">Site</p>
            <ul className="flex flex-col gap-2">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-mono text-xs text-dim transition-colors hover:text-signal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="/rss.xml"
                  className="font-mono text-xs text-dim transition-colors hover:text-signal"
                >
                  RSS
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label">
            © {new Date().getFullYear()} {site.name}
          </p>
          <p className="label">{site.location}</p>
        </div>
      </div>
    </footer>
  );
}
