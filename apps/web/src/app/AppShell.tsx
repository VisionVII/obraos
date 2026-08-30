import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/obras", label: "Obras" },
  { to: "/agenda", label: "Agenda" },
  { to: "/clientes", label: "Clientes" },
  { to: "/mais", label: "Mais" },
];
const desktopOnly = [
  { to: "/orcamentos", label: "Orçamentos" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/documentos", label: "Documentos" },
  { to: "/equipa", label: "Equipa" },
  { to: "/definicoes", label: "Definições" },
];

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `min-h-touch flex items-center px-3 rounded font-medium ${isActive ? "bg-signal text-steel-900" : "text-concrete-200 hover:bg-steel-500"}`;

/** Desktop: sidebar. Mobile: barra inferior com 5 destinos. */
export function AppShell() {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden md:flex flex-col gap-1 bg-steel-700 p-3">
        <div className="font-display text-2xl font-semibold text-concrete-50 px-3 py-4">ObraOS</div>
        {[...nav.filter((n) => n.to !== "/mais"), ...desktopOnly].map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkCls}>{n.label}</NavLink>
        ))}
      </aside>
      <main className="p-4 pb-24 md:p-8 md:pb-8 max-w-6xl">
        <Outlet />
      </main>
      <nav className="md:hidden fixed inset-x-0 bottom-0 grid grid-cols-5 bg-steel-700 pb-[env(safe-area-inset-bottom)]" aria-label="Principal">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"}
            className={({ isActive }) => `min-h-[56px] flex items-center justify-center text-sm font-medium ${isActive ? "text-signal" : "text-concrete-200"}`}>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
