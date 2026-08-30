import { NavLink, Outlet } from "react-router-dom";
import { Permission, type Role, hasPermission } from "@obraos/shared";
import { useLogout, useResendVerification, useSession } from "@/features/auth/use-session";
import { Button } from "@/shared/ui/Button";

type NavItem = { to: string; label: string; permission?: Permission };

const nav: NavItem[] = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/obras", label: "Obras" },
  { to: "/app/agenda", label: "Agenda" },
  { to: "/app/clientes", label: "Clientes", permission: Permission.CLIENTS_READ },
  { to: "/app/mais", label: "Mais" },
];
const desktopOnly: NavItem[] = [
  { to: "/app/orcamentos", label: "Orçamentos" },
  { to: "/app/financeiro", label: "Financeiro" },
  { to: "/app/documentos", label: "Documentos" },
  { to: "/app/equipa", label: "Equipa" },
  { to: "/app/definicoes", label: "Definições" },
];

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `min-h-touch flex items-center px-3 rounded font-medium ${isActive ? "bg-signal text-steel-900" : "text-concrete-200 hover:bg-steel-500"}`;

/** Aviso persistente até o utilizador confirmar o email — não bloqueia o uso da app. */
function EmailVerifyBanner() {
  const { data: user } = useSession();
  const resend = useResendVerification();
  if (!user || user.emailVerified) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
      <span>Confirme o seu email para garantir o acesso à conta.</span>
      {resend.isSuccess ? (
        <span className="font-medium">Email reenviado.</span>
      ) : (
        <button
          className="font-semibold underline underline-offset-2 disabled:opacity-50"
          disabled={resend.isPending}
          onClick={() => resend.mutate({ email: user.email })}
        >
          {resend.isPending ? "A enviar…" : "Reenviar email"}
        </button>
      )}
    </div>
  );
}

function Topbar() {
  const { data: user } = useSession();
  const logout = useLogout();
  return (
    <div className="sticky -top-4 z-10 -mx-4 flex items-center justify-between gap-4 border-b border-concrete-200 bg-concrete-100/80 px-4 py-3 backdrop-blur md:-top-8 md:-mx-8 md:px-8">
      <div className="md:hidden font-display text-xl font-semibold text-steel-900">ObraOS</div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-steel-500">{user?.name}</span>
        <Button variant="ghost" className="min-h-0 h-9 px-3 text-sm" onClick={() => logout.mutate()}>
          Sair
        </Button>
      </div>
    </div>
  );
}

/** A matriz RBAC partilhada só esconde UI; a decisão real é sempre no backend. */
const visibleTo = (role: Role | undefined, item: { permission?: Permission }) =>
  !item.permission || (!!role && hasPermission(role, item.permission));

/** Desktop: sidebar. Mobile: barra inferior com 5 destinos. */
export function AppShell() {
  const { data: user } = useSession();

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden md:flex flex-col gap-1 bg-steel-700 p-3">
        <div className="font-display text-2xl font-semibold text-concrete-50 px-3 py-4">ObraOS</div>
        {[...nav.filter((n) => n.to !== "/app/mais"), ...desktopOnly].filter((n) => visibleTo(user?.role, n)).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/app"} className={linkCls}>{n.label}</NavLink>
        ))}
      </aside>
      <main className="flex flex-col gap-4 p-4 pb-24 md:p-8 md:pb-8 max-w-6xl">
        <Topbar />
        <EmailVerifyBanner />
        <Outlet />
      </main>
      <nav className="md:hidden fixed inset-x-0 bottom-0 grid grid-cols-5 bg-steel-700 pb-[env(safe-area-inset-bottom)]" aria-label="Principal">
        {nav.filter((n) => visibleTo(user?.role, n)).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/app"}
            className={({ isActive }) => `min-h-[56px] flex items-center justify-center text-sm font-medium ${isActive ? "text-signal" : "text-concrete-200"}`}>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
