import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "./use-session";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();
  const nav = useNavigate();

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-semibold text-steel-900">Criar conta</h1>
        <p className="mt-1 text-steel-500">Comece a organizar as suas obras hoje.</p>
        <div className="mt-8 flex flex-col gap-4">
          <Field id="name" label="O seu nome" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field id="organizationName" label="Nome da empresa" autoComplete="organization" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="password" label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {register.isError && <p role="alert" className="text-sm text-danger">{register.error.message}</p>}
          <Button
            variant="signal"
            disabled={register.isPending}
            onClick={() => register.mutate({ name, organizationName, email, password }, { onSuccess: () => nav("/") })}
          >
            {register.isPending ? "A criar conta…" : "Criar conta"}
          </Button>
          <p className="text-center text-sm text-steel-500">
            Já tem conta? <Link to="/login" className="font-medium text-steel-700 hover:text-steel-900">Entrar</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
