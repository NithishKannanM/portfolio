/**
 * Scroll-reveal regression probe.
 *
 * Guards the failure this exists for: a `data-reveal` element that scrolls past
 * the IntersectionObserver band between two callbacks is never reported as
 * intersecting, and with `once: true` it stays at opacity 0 forever. That only
 * reproduces under *fast* scrolling, so each route is swept three ways —
 * gradual, instant jump to the bottom, and a burst of large hops.
 *
 * Usage: CHROME=/usr/bin/google-chrome node probe.mjs [baseUrl]
 * Exits non-zero if any element is left hidden.
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3000";

/** Routes that must exist in every environment. Keep drafts out of this list —
 *  they 404 in production, and the status check below would fail the run. */
const ROUTES = [
  "/",
  "/about",
  "/work",
  "/blog",
  "/lab",
  "/contact",
  "/work/ring-zero",
  "/lab/rrf-k",
  "/blog/reciprocal-rank-fusion-in-practice",
];

/** Each mode leaves the page scrolled to the bottom, having passed every section. */
const MODES = {
  gradual: async (page) =>
    page.evaluate(async () => {
      const step = window.innerHeight * 0.6;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, document.body.scrollHeight);
    }),

  // The worst case: one jump over the entire document in a single frame.
  jump: async (page) =>
    page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)),

  // Viewport-sized hops with no settle time — closest to a flung trackpad.
  burst: async (page) =>
    page.evaluate(async () => {
      const step = window.innerHeight * 1.5;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(r));
      }
      window.scrollTo(0, document.body.scrollHeight);
    }),
};

const browser = await chromium.launch({ executablePath: process.env.CHROME });
const failures = [];

for (const route of ROUTES) {
  for (const [mode, scroll] of Object.entries(MODES)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const response = await page.goto(BASE + route, { waitUntil: "networkidle" });

    // Without this a 404 sails through: it has no reveals, so "none hidden"
    // reads as a pass.
    if (!response || response.status() !== 200) {
      const status = response ? response.status() : "no response";
      failures.push({ label: `${route} [${mode}]`, status });
      console.log(`FAIL ${route} [${mode}] — HTTP ${status}`);
      await page.close();
      continue;
    }

    await scroll(page);
    // Outlast the longest transition (dur.slow) plus the stagger tail.
    await page.waitForTimeout(1500);

    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal]")]
        .map((el, i) => ({
          i,
          op: getComputedStyle(el).opacity,
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 40),
        }))
        .filter((x) => parseFloat(x.op) < 0.99),
    );
    const total = await page.evaluate(
      () => document.querySelectorAll("[data-reveal]").length,
    );

    const label = `${route} [${mode}]`;
    if (hidden.length) {
      failures.push({ label, hidden, total });
      console.log(`FAIL ${label} — ${hidden.length}/${total} still hidden`);
      hidden.forEach((h) => console.log(`       #${h.i} <${h.tag}> op=${h.op} ${h.cls}`));
    } else {
      console.log(`ok   ${label} — ${total}/${total} revealed`);
    }

    await page.close();
  }
}

await browser.close();

if (failures.length) {
  console.log(`\n${failures.length} failing route/mode combinations.`);
  process.exit(1);
}
console.log("\nAll routes fully revealed under every scroll mode.");
