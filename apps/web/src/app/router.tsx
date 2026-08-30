import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "./AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/features/auth/VerifyEmailPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { useSession } from "@/features/auth/use-session";

function RequireAuth() {
  const { data: user, isLoading } = useSession();
  if (isLoading) return <div className="p-8 text-steel-500">A carregar…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

const Placeholder = ({ title }: { title: string }) => (
  <h1 className="text-3xl font-semibold text-steel-500">{title} — em breve</h1>
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/obras", element: <Placeholder title="Obras" /> },
          { path: "/agenda", element: <Placeholder title="Agenda" /> },
          { path: "/clientes", element: <Placeholder title="Clientes" /> },
          { path: "/orcamentos", element: <Placeholder title="Orçamentos" /> },
          { path: "/financeiro", element: <Placeholder title="Financeiro" /> },
          { path: "/documentos", element: <Placeholder title="Documentos" /> },
          { path: "/equipa", element: <Placeholder title="Equipa" /> },
          { path: "/definicoes", element: <Placeholder title="Definições" /> },
          { path: "/mais", element: <Placeholder title="Mais" /> },
        ],
      },
    ],
  },
]);
