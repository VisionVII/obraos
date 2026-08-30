import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResendVerification, useSession, useVerifyEmail } from "./use-session";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { data: user } = useSession();
  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();
  const [email, setEmail] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      verifyEmail.mutate({ token });
    }
  }, [token, verifyEmail]);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-semibold text-steel-900">Verificar email</h1>

        {token && verifyEmail.isPending && <p className="mt-4 text-steel-500">A verificar…</p>}

        {verifyEmail.isSuccess && (
          <>
            <p className="mt-4 text-ok">Email verificado com sucesso.</p>
            <Link to="/app" className="mt-6 inline-block font-medium text-steel-700 hover:text-steel-900">Ir para a dashboard</Link>
          </>
        )}

        {(verifyEmail.isError || !token) && (
          <div className="mt-4 flex flex-col gap-4 text-left">
            <p className="text-steel-500">
              {token ? "Este link é inválido ou já expirou." : "Introduza o seu email para receber um novo link."}
            </p>
            {resend.isSuccess ? (
              <p className="rounded-lg border border-concrete-300 bg-white p-4 text-steel-700">
                Se a conta existir e ainda não estiver verificada, enviámos um novo link.
              </p>
            ) : (
              <>
                <Field
                  id="email" label="Email" type="email" autoComplete="email"
                  value={email || user?.email || ""} onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  variant="signal"
                  disabled={resend.isPending}
                  onClick={() => resend.mutate({ email: email || user?.email || "" })}
                >
                  {resend.isPending ? "A enviar…" : "Reenviar link"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
