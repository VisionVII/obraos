import { NavLink, Outlet } from "react-router-dom";
import { useLogout, useResendVerification, useSession } from "@/features/auth/use-session";
import { Button } from "@/shared/ui/Button";

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
    <div className="flex items-center justify-between gap-4">
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
      <main className="flex flex-col gap-4 p-4 pb-24 md:p-8 md:pb-8 max-w-6xl">
        <Topbar />
        <EmailVerifyBanner />
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
