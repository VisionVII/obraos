import { useState } from "react";
import { useChangePassword, useSession } from "@/features/auth/use-session";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Blueprint } from "@/shared/ui/Blueprint";
import { Tag } from "@/shared/ui/Tag";

const ROLE_LABELS: Record<string, string> = {
  owner: "Dono", admin: "Administrador", manager: "Gestor",
  worker: "Trabalhador", subcontractor: "Subcontratado", client: "Cliente",
};

function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && newPassword !== confirm;

  function handleSubmit() {
    changePassword.mutate(
      { currentPassword, newPassword },
      { onSuccess: () => { setCurrentPassword(""); setNewPassword(""); setConfirm(""); } },
    );
  }

  return (
    <Blueprint className="flex max-w-sm flex-col gap-4 bg-white p-4">
      <Field id="currentPassword" label="Password atual" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <Field id="newPassword" label="Nova password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Field
        id="confirmPassword" label="Confirmar nova password" type="password" autoComplete="new-password"
        value={confirm} onChange={(e) => setConfirm(e.target.value)}
        {...(mismatch ? { error: "As passwords não coincidem." } : {})}
      />
      {changePassword.isError && <p role="alert" className="text-sm text-danger">{changePassword.error.message}</p>}
      {changePassword.isSuccess && <p className="text-sm text-ok">Password alterada. As restantes sessões foram terminadas.</p>}
      <Button
        variant="signal"
        disabled={changePassword.isPending || !currentPassword || !newPassword || mismatch}
        onClick={handleSubmit}
      >
        {changePassword.isPending ? "A guardar…" : "Mudar password"}
      </Button>
    </Blueprint>
  );
}

export function SettingsPage() {
  const { data: user } = useSession();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold text-steel-900">Definições</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-steel-500">A sua conta</h2>
        <Blueprint className="max-w-sm bg-white p-4">
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <dt className="text-steel-500">Nome</dt><dd className="text-steel-900">{user.name}</dd>
            <dt className="text-steel-500">Email</dt><dd className="text-steel-900">{user.email}</dd>
            <dt className="text-steel-500">Função</dt><dd className="text-steel-900">{ROLE_LABELS[user.role] ?? user.role}</dd>
            <dt className="text-steel-500">Email verificado</dt>
            <dd><Tag variant={user.emailVerified ? "ok" : "warn"}>{user.emailVerified ? "Sim" : "Não"}</Tag></dd>
          </dl>
        </Blueprint>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-steel-500">Mudar password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
