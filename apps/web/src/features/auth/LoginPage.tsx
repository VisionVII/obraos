import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "./use-session";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const nav = useNavigate();

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-semibold text-steel-900">ObraOS</h1>
        <p className="mt-1 text-steel-500">O seu trabalho. As suas obras. Num só lugar.</p>
        <div className="mt-8 flex flex-col gap-4">
          <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {login.isError && <p role="alert" className="text-sm text-danger">{login.error.message}</p>}
          <Button
            variant="signal"
            disabled={login.isPending}
            onClick={() => login.mutate({ email, password }, { onSuccess: () => nav("/") })}
          >
            {login.isPending ? "A entrar…" : "Entrar"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-steel-500 hover:text-steel-900">Esqueceu a password?</Link>
            <Link to="/register" className="font-medium text-steel-700 hover:text-steel-900">Criar conta</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
