import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The core surface of the site. A hairline-bordered rectangle — never a
 * shadowed card. `corners` adds crop-marks, which is what makes it read as
 * an instrument face rather than a UI card. Use sparingly, on focal panels.
 */
export function Panel({
  children,
  className,
  corners = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  corners?: boolean;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag
      className={cn(
        "border border-line bg-panel",
        corners && "corner-ticks",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Panel header: a mono micro-label on the left, optional readout on the
 * right, separated from the body by a hairline. Mirrors the way real
 * instrument panels label their channels.
 */
export function PanelHeader({
  label,
  aside,
  className,
}: {
  label: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-line px-4 py-2.5",
        className,
      )}
    >
      <span className="label">{label}</span>
      {aside ? <span className="label text-dim">{aside}</span> : null}
    </div>
  );
}

/** Mono micro-label. The site's connective tissue. */
export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("label", className)}>{children}</span>;
}

/** Full-bleed hairline used to separate page sections. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
