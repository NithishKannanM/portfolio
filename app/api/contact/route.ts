import type { NextRequest } from "next/server";

/**
 * Contact form relay.
 *
 * The form used to call EmailJS straight from the browser, which meant the
 * service id, template id, and public key were all inlined in the client
 * bundle — anyone could read them and spend the month's quota. EmailJS puts
 * domain allowlisting behind a paid plan, so the free fix is to stop exposing
 * the credentials: the browser posts here, and this route calls EmailJS
 * server-side with the private key, which never leaves the server.
 *
 * Requires "Allow EmailJS API for non-browser applications" to be ON in
 * EmailJS → Account → Security. Keep "Use Private Key" on as well — that's
 * what makes `accessToken` below actually required.
 */

const ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

const LIMITS = { name: 100, email: 254, message: 5000 } as const;

/** Submitting faster than this is a bot, not a reader. Mirrors the client
 *  check, because a client-side guard is a courtesy, not a control. */
const MIN_ELAPSED_MS = 2000;

/**
 * Per-IP throttle. Deliberately in-memory: it resets on cold start and isn't
 * shared across serverless instances, so it raises the cost of casual abuse
 * rather than making it impossible. Anything stronger needs external state
 * (Upstash's free tier is the usual next step) — not worth it at this volume.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

/**
 * Backstop across every caller, spoofed identity or not.
 *
 * The per-IP limit is only as trustworthy as the IP, and the IP arrives in a
 * header. This one can't be bypassed by forging anything, which matters
 * because the asset being protected is a hard 200-sends-a-month quota: a
 * bypass doesn't just spam the inbox, it takes the form offline for the rest
 * of the month.
 */
const GLOBAL_MAX_PER_WINDOW = 8;
let globalHits: number[] = [];

function rateLimited(ip: string): boolean {
  const now = Date.now();

  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  globalHits.push(now);
  if (globalHits.length > GLOBAL_MAX_PER_WINDOW) return true;

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Crude cap so a flood of distinct IPs can't grow the map without bound.
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/**
 * `x-forwarded-for` is a client-supplied header. Reading its *first* entry —
 * the obvious implementation — lets anyone rotate a fake value per request and
 * walk straight through the per-IP limit; verified by doing exactly that.
 *
 * The last entry is the one appended by the nearest trusted proxy, so it is
 * the first value the client could not have written. `x-vercel-forwarded-for`
 * is better still: Vercel sets it and strips any inbound copy, so prefer it
 * where it exists.
 */
function clientIp(request: NextRequest): string {
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",").pop()!.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const chain = forwarded.split(",").filter((p) => p.trim());
    if (chain.length) return chain[chain.length - 1].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * `name` and `email` are interpolated into the template's Subject and Reply-To,
 * which are mail *headers*. A newline in a header value is how header injection
 * works, so strip every control character before they get near one. EmailJS
 * very likely sanitises too; this costs nothing and doesn't depend on that.
 */
const stripControl = (value: string) => value.replace(/[\u0000-\u001F\u007F]/g, " ").trim();

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  const { SERVICE, TEMPLATE, PUBLIC, PRIVATE } = {
    SERVICE: process.env.EMAILJS_SERVICE_ID,
    TEMPLATE: process.env.EMAILJS_TEMPLATE_ID,
    PUBLIC: process.env.EMAILJS_PUBLIC_KEY,
    PRIVATE: process.env.EMAILJS_PRIVATE_KEY,
  };

  if (!SERVICE || !TEMPLATE || !PUBLIC || !PRIVATE) {
    return fail("The form isn't configured yet. Please email me directly.", 503);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return fail("Malformed request.", 400);
  }

  // name and email land in mail headers, so they lose control characters
  // entirely. message is a body and keeps its newlines.
  const name = stripControl(String(payload.name ?? ""));
  const email = stripControl(String(payload.email ?? ""));
  const message = String(payload.message ?? "").trim();
  const company = String(payload.company ?? "");
  const elapsed = Number(payload.elapsed ?? 0);

  // Bots fill every field they find, and they fill them instantly. Both get a
  // 200 so an attacker learns nothing about which check caught them.
  if (company || !Number.isFinite(elapsed) || elapsed < MIN_ELAPSED_MS) {
    return Response.json({ ok: true });
  }

  if (!name || !email || !message) return fail("Please fill in every field.", 400);
  if (!isEmail(email)) return fail("That email address doesn't look right.", 400);
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    return fail("That message is too long to send.", 413);
  }

  if (rateLimited(clientIp(request))) {
    return fail("Too many messages just now — try again in a minute.", 429);
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: SERVICE,
      template_id: TEMPLATE,
      user_id: PUBLIC,
      accessToken: PRIVATE,
      template_params: {
        from_name: name,
        from_email: email,
        message,
        to_name: "Nithish Kannan M",
      },
    }),
  });

  if (!response.ok) {
    // EmailJS returns plain text; log the real reason, show the visitor none of it.
    console.error("EmailJS rejected the send:", response.status, await response.text());
    return fail("Something went wrong sending that. Please email me directly.", 502);
  }

  return Response.json({ ok: true });
}
