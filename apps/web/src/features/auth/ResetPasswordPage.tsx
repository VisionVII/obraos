import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPassword } from "./use-session";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Blueprint } from "@/shared/ui/Blueprint";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const resetPassword = useResetPassword();

  const mismatch = confirm.length > 0 && password !== confirm;

  if (!token) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-4xl font-semibold text-steel-900">Link inválido</h1>
          <p className="mt-2 text-steel-500">Este link de reposição está incompleto. Peça um novo.</p>
          <Link to="/forgot-password" className="mt-6 inline-block font-medium text-steel-700 hover:text-steel-900">
            Pedir novo link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-semibold text-steel-900">Nova password</h1>
        {resetPassword.isSuccess ? (
          <>
            <Blueprint className="mt-8 bg-white p-4 text-steel-700">
              Password reposta. Todas as sessões anteriores foram terminadas — entre com a nova password.
            </Blueprint>
            <Link to="/login" className="mt-6 inline-block font-medium text-steel-700 hover:text-steel-900">
              Entrar
            </Link>
          </>
        ) : (
          <Blueprint className="mt-8 flex flex-col gap-4 bg-white p-4">
            <Field id="password" label="Nova password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Field
              id="confirm" label="Confirmar password" type="password" autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              {...(mismatch ? { error: "As passwords não coincidem." } : {})}
            />
            {resetPassword.isError && <p role="alert" className="text-sm text-danger">{resetPassword.error.message}</p>}
            <Button
              variant="signal"
              disabled={resetPassword.isPending || !password || mismatch}
              onClick={() => resetPassword.mutate({ token, password })}
            >
              {resetPassword.isPending ? "A repor…" : "Repor password"}
            </Button>
          </Blueprint>
        )}
      </div>
    </main>
  );
}
