import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "signal" | "ghost";
const styles: Record<ButtonVariant, string> = {
  primary: "bg-steel-700 text-concrete-50 hover:bg-steel-900",
  signal: "bg-signal text-steel-900 hover:bg-signal-600",
  ghost: "bg-transparent text-steel-700 hover:bg-concrete-200",
};

/** Mesmas classes do Button, para usar em links (`<Link>`, `<a>`) que devem parecer botões. */
export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `min-h-touch inline-flex items-center justify-center px-5 rounded font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`;
}

/** Alvo de toque mínimo 48px: usável com luvas e uma mão. */
export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button {...props} className={buttonClassName(variant, className)} />;
}
