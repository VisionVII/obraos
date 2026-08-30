import { useSession } from "@/features/auth/use-session";
import { Stat } from "@/shared/ui/Stat";

/** Fase 1 liga estes números à API. Aqui só a estrutura e os empty states. */
export function DashboardPage() {
  const { data: user } = useSession();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 20 ? "Boa tarde" : "Boa noite";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{greeting}, {user?.name.split(" ")[0]}</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat value="0" label="Obras ativas" />
        <Stat value="€0" label="Por receber" tone="warn" />
        <Stat value="€0" label="Custos" />
        <Stat value="0" label="Orçamentos pendentes" />
      </div>
      <section>
        <h2 className="text-xl font-semibold text-steel-500">Hoje</h2>
        <p className="mt-2 rounded-lg border border-dashed border-concrete-300 p-6 text-center text-steel-500">
          Sem nada agendado para hoje. Crie um cliente para começar.
        </p>
      </section>
    </div>
  );
}
