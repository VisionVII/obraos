import { Link } from "react-router-dom";
import { Permission, hasPermission } from "@obraos/shared";
import { useSession } from "@/features/auth/use-session";
import { useClients } from "./use-clients";
import { buttonClassName } from "@/shared/ui/Button";

export function ClientsPage() {
  const { data: user } = useSession();
  const { data: clients, isLoading, isError, error } = useClients();
  const canWrite = !!user && hasPermission(user.role, Permission.CLIENTS_WRITE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-steel-900">Clientes</h1>
        {canWrite && (
          <Link to="/app/clientes/novo" className={buttonClassName("signal", "h-11 px-4")}>
            + Novo cliente
          </Link>
        )}
      </div>

      {isLoading && <p className="text-steel-500">A carregar…</p>}
      {isError && <p role="alert" className="text-danger">{error.message}</p>}

      {clients && clients.length === 0 && (
        <p className="rounded-lg border border-dashed border-concrete-300 p-6 text-center text-steel-500">
          Ainda não tem clientes. Crie o primeiro para começar.
        </p>
      )}

      {clients && clients.length > 0 && (
        <ul className="flex flex-col gap-2">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                to={`/app/clientes/${c.id}`}
                className="flex flex-col gap-1 rounded-lg border border-concrete-200 bg-white p-4 transition-colors hover:border-steel-500"
              >
                <span className="font-semibold text-steel-900">{c.name}</span>
                <span className="text-sm text-steel-500">
                  {[c.phone, c.email].filter(Boolean).join(" · ") || "Sem contacto"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
