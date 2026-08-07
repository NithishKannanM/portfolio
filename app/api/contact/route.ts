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

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Crude cap so a flood of distinct IPs can't grow the map without bound.
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
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
