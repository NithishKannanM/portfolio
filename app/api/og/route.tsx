import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

// Node runtime so the Geist .ttf files can be read off disk — Satori needs
// real font data, and the woff2 variants aren't supported.
export const runtime = "nodejs";

const FONT_DIR = path.join(process.cwd(), "node_modules/geist/dist/fonts");

function loadFont(family: "geist-sans" | "geist-mono", file: string) {
  return fs.readFileSync(path.join(FONT_DIR, family, file));
}

/** Matches the site palette in app/globals.css. */
const c = {
  void: "#08090a",
  panel: "#0e1011",
  line: "#1c1f21",
  lineHi: "#2b3034",
  fg: "#e6e8ea",
  muted: "#6b7176",
  signal: "#e8a33d",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? site.name).slice(0, 110);
  const subtitle = (searchParams.get("subtitle") ?? site.tagline).slice(0, 90);
  const kind = searchParams.get("kind") ?? "site";

  const [sans, mono] = [
    loadFont("geist-sans", "Geist-SemiBold.ttf"),
    loadFont("geist-mono", "GeistMono-Regular.ttf"),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: c.void,
          // Hairline grid — the same engineering-paper field as the hero.
          backgroundImage: `linear-gradient(to right, ${c.line} 1px, transparent 1px), linear-gradient(to bottom, ${c.line} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          padding: 64,
          fontFamily: "Geist",
        }}
      >
        {/* Top rail */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${c.line}`,
            paddingBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: 8, background: c.signal }} />
            <span
              style={{
                fontFamily: "Geist Mono",
                fontSize: 20,
                letterSpacing: 3,
                color: c.muted,
                textTransform: "uppercase",
              }}
            >
              {kind === "post" ? "Writing" : kind === "work" ? "Work" : site.role}
            </span>
          </div>
          <span style={{ fontFamily: "Geist Mono", fontSize: 20, color: c.muted }}>
            nithishkannanm.com
          </span>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 60 ? 58 : 72,
              lineHeight: 1.08,
              letterSpacing: -2.5,
              color: c.fg,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontFamily: "Geist Mono",
                fontSize: 26,
                color: c.signal,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Bottom rail */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${c.line}`,
            paddingTop: 24,
          }}
        >
          <span style={{ fontFamily: "Geist Mono", fontSize: 22, color: c.fg }}>{site.name}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[0.25, 0.5, 0.85, 1].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 24 * h,
                  background: i === 3 ? c.signal : c.lineHi,
                  alignSelf: "flex-end",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: sans, style: "normal", weight: 600 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
