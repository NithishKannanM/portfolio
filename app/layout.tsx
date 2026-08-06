import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion-provider";
import { Nav } from "@/components/nav";
import { site } from "@/lib/site";

import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${site.url}/rss.xml` },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Entrance animations start their targets at opacity 0 — Motion
          server-renders that inline style, and the hero sets it directly.
          Without JS there is nothing to animate them back in, so this
          override makes every animated element render in its final state.
          Only applies when scripting is off, so it costs nothing otherwise.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-signal focus:bg-void focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
        >
          Skip to content
        </a>

        <MotionProvider>
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </MotionProvider>

        <script
          type="application/ld+json"
          // Person schema — helps search engines connect the site, the
          // GitHub account, and the name.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.name,
              url: site.url,
              email: `mailto:${site.email}`,
              jobTitle: site.role,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Chennai",
                addressRegion: "Tamil Nadu",
                addressCountry: "IN",
              },
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "Vellore Institute of Technology, Chennai",
              },
              sameAs: [site.socials.github, site.socials.linkedin],
            }),
          }}
        />
      </body>
    </html>
  );
}
