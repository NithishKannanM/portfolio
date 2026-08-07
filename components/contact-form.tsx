"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

// No `focus:outline-none` — the global :focus-visible ring in globals.css is
// the keyboard indicator, and suppressing the outline here would win on
// specificity and remove it.
const field =
  "w-full border border-line bg-panel px-3.5 py-2.5 text-sm text-fg placeholder:text-muted transition-colors focus:border-line-hi";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Bots fill every field they find; humans never see this one.
  const honeypot = useRef<HTMLInputElement>(null);
  // Set on mount rather than during render — Date.now() in a render body is
  // impure, and the timestamp only needs to exist before a submit can happen.
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (honeypot.current?.value) return; // silently drop
    if (Date.now() - openedAt.current < 2000) return; // submitted too fast to be human

    setStatus("sending");
    setError(null);

    const data = new FormData(form);
    try {
      // Posts to our own route rather than EmailJS: the credentials live on
      // the server, so nothing sensitive ships in this bundle. See
      // app/api/contact/route.ts.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"),
          elapsed: Date.now() - openedAt.current,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Request failed.");
      }

      setStatus("sent");
      form.reset();
      openedAt.current = Date.now();
    } catch (cause) {
      console.error("Contact form failed:", cause);
      setStatus("error");
      // The route's messages are visitor-safe by construction; anything else
      // falls back to the generic line.
      setError(
        cause instanceof Error && cause.message !== "Request failed."
          ? cause.message
          : "Something went wrong sending that. Please email me directly.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div>
        <label htmlFor="name" className="label mb-2 block">
          Name
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={field} />
      </div>

      <div>
        <label htmlFor="email" className="label mb-2 block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          spellCheck={false}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="message" className="label mb-2 block">
          Message
        </label>
        <textarea id="message" name="message" rows={6} required className={cn(field, "resize-y")} />
      </div>

      {/* Honeypot — hidden from users and assistive tech, visible to bots. */}
      <div className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} ref={honeypot} />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full border border-line-hi bg-panel px-5 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>

      <p role="status" aria-live="polite" className="font-mono text-xs">
        {status === "sent" ? (
          <span className="text-good">Sent — I&rsquo;ll get back to you.</span>
        ) : null}
        {status === "error" && error ? <span className="text-bad">{error}</span> : null}
      </p>
    </form>
  );
}
