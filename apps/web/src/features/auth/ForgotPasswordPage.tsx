import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "./use-session";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Blueprint } from "@/shared/ui/Blueprint";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-semibold text-steel-900">Recuperar password</h1>
        <p className="mt-1 text-steel-500">Enviamos-lhe um link para repor a password.</p>
        {forgotPassword.isSuccess ? (
          <Blueprint className="mt-8 bg-white p-4 text-steel-700">
            Se existir uma conta com este email, enviámos um link de reposição. Verifique a caixa de entrada.
          </Blueprint>
        ) : (
          <Blueprint className="mt-8 flex flex-col gap-4 bg-white p-4">
            <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button
              variant="signal"
              disabled={forgotPassword.isPending}
              onClick={() => forgotPassword.mutate({ email })}
            >
              {forgotPassword.isPending ? "A enviar…" : "Enviar link"}
            </Button>
          </Blueprint>
        )}
        <p className="mt-6 text-center text-sm text-steel-500">
          <Link to="/login" className="font-medium text-steel-700 hover:text-steel-900">Voltar a entrar</Link>
        </p>
      </div>
    </main>
  );
}
