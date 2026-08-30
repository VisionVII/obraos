import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "signal" | "ghost";
const styles: Record<Variant, string> = {
  primary: "bg-steel-700 text-concrete-50 hover:bg-steel-900",
  signal: "bg-signal text-steel-900 hover:bg-signal-600",
  ghost: "bg-transparent text-steel-700 hover:bg-concrete-200",
};

/** Alvo de toque mínimo 48px: usável com luvas e uma mão. */
export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`min-h-touch px-5 rounded font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}
