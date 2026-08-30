/** Número grande, etiqueta pequena — a assinatura visual do ObraOS. */
export function Stat({ value, label, tone = "default" }: { value: string; label: string; tone?: "default" | "ok" | "warn" }) {
  const color = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-steel-900";
  return (
    <div className="rounded-lg bg-white p-4 border border-concrete-200">
      <div className={`font-display text-num-lg ${color}`}>{value}</div>
      <div className="mt-1 text-sm text-steel-500">{label}</div>
    </div>
  );
}
