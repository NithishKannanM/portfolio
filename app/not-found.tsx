import Link from "next/link";

import { Panel, PanelHeader } from "@/components/panel";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-28">
      <Panel corners className="w-full max-w-xl">
        <PanelHeader label="Status" aside="404" />
        <div className="p-8">
          <h1 className="text-3xl font-semibold tracking-tight">No route to that page</h1>
          <p className="mt-4 text-sm leading-relaxed text-dim">
            The address resolved but nothing is served here. It may have moved, or it
            may never have existed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="border border-line-hi px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors hover:border-signal hover:text-signal"
            >
              Home
            </Link>
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-line px-4 py-2 font-mono text-xs tracking-wider uppercase text-dim transition-colors hover:border-line-hi hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
