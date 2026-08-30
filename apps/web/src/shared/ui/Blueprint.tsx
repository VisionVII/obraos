import type { HTMLAttributes } from "react";

/** Cartão com cantos técnicos — a moldura "desenho de obra" para formulários e itens de destaque. */
export function Blueprint({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`relative border border-concrete-300 ${className}`}>
      <span aria-hidden className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-signal" />
      <span aria-hidden className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-signal" />
      <span aria-hidden className="pointer-events-none absolute -left-px -bottom-px h-3 w-3 border-l-2 border-b-2 border-signal" />
      <span aria-hidden className="pointer-events-none absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-signal" />
      {children}
    </div>
  );
}
