import type { ReactNode } from "react";

type TagVariant = "accent" | "outline" | "neutral" | "ok" | "warn";
const styles: Record<TagVariant, string> = {
  accent: "bg-signal-100 text-signal-800 border-transparent",
  outline: "bg-transparent text-steel-700 border-concrete-300",
  neutral: "bg-concrete-200 text-steel-700 border-transparent",
  ok: "bg-ok/10 text-ok border-transparent",
  warn: "bg-warn/10 text-warn border-transparent",
};

/** Selo de estado — usar para etapas, verificação, disponibilidade. */
export function Tag({ variant = "neutral", children }: { variant?: TagVariant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
