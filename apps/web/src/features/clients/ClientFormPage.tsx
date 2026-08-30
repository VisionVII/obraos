import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClient, useCreateClient, useDeleteClient, useUpdateClient } from "./use-clients";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";

export function ClientFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();

  const { data: client, isLoading } = useClient(id);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(id ?? "");
  const deleteClient = useDeleteClient();
  const save = isEdit ? updateClient : createClient;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone ?? "");
      setEmail(client.email ?? "");
      setAddress(client.address ?? "");
      setNotes(client.notes ?? "");
    }
  }, [client]);

  if (isEdit && isLoading) return <p className="text-steel-500">A carregar…</p>;

  const busy = save.isPending || deleteClient.isPending;

  function handleSubmit() {
    save.mutate(
      { name, phone: phone || undefined, email: email || undefined, address: address || undefined, notes: notes || undefined },
      { onSuccess: () => nav("/app/clientes") },
    );
  }

  function handleDelete() {
    if (!id || !confirm(`Eliminar "${client?.name}"? Esta ação não pode ser desfeita.`)) return;
    deleteClient.mutate(id, { onSuccess: () => nav("/app/clientes") });
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-3xl font-semibold text-steel-900">{isEdit ? "Editar cliente" : "Novo cliente"}</h1>
      <div className="flex flex-col gap-4">
        <Field id="name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Field id="phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Field id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="address" label="Morada" value={address} onChange={(e) => setAddress(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-steel-500">Notas</label>
          <textarea
            id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="rounded border border-concrete-300 bg-white px-3 py-2 text-base text-steel-900 placeholder:text-concrete-500"
          />
        </div>
        {save.isError && <p role="alert" className="text-sm text-danger">{save.error.message}</p>}
        <div className="flex gap-3">
          <Button variant="signal" disabled={busy || !name.trim()} onClick={handleSubmit}>
            {save.isPending ? "A guardar…" : "Guardar"}
          </Button>
          {isEdit && (
            <Button variant="ghost" disabled={busy} onClick={handleDelete}>
              {deleteClient.isPending ? "A eliminar…" : "Eliminar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
