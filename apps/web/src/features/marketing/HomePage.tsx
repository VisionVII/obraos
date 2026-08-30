import { Link } from "react-router-dom";
import { useSession } from "@/features/auth/use-session";
import { buttonClassName } from "@/shared/ui/Button";
import { Blueprint } from "@/shared/ui/Blueprint";

const WORKFLOW = ["Cliente", "Orçamento", "Obra", "Trabalho", "Custos", "Pagamentos", "Conclusão"];

const FEATURES = [
  {
    title: "Obras e agenda",
    text: "Planeie obras e trabalhos do dia a dia. Pensado para o telemóvel: usável com uma mão e com luvas no terreno.",
  },
  {
    title: "Orçamentos e financeiro",
    text: "Do orçamento ao pagamento num único fluxo — sem folhas de cálculo dispersas nem grupos de WhatsApp a mais.",
  },
  {
    title: "Clientes e documentos",
    text: "Histórico de clientes, contactos e documentos de cada obra sempre à mão, organizados por cliente.",
  },
  {
    title: "Equipa com permissões",
    text: "Cada função vê só o que precisa: dono, gestor, trabalhador, subcontratado ou cliente do portal.",
  },
];

function Header() {
  const { data: user } = useSession();
  return (
    <header className="sticky top-0 z-10 border-b border-concrete-200 bg-concrete-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-2xl font-semibold text-steel-900">ObraOS</span>
        </div>
        {user ? (
          <Link to="/app" className={buttonClassName("signal", "h-10")}>Ir para a dashboard</Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="min-h-touch flex items-center px-3 font-medium text-steel-700 hover:text-steel-900">
              Entrar
            </Link>
            <Link to="/register" className={buttonClassName("signal", "h-10")}>Criar conta</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function HomePage() {
  return (
    <div className="min-h-dvh bg-concrete-50">
      <Header />

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-8 md:py-24">
          <h1 className="font-display text-4xl font-semibold text-steel-900 md:text-6xl">
            O seu trabalho. As suas obras.<br className="hidden md:block" /> Num só lugar.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-steel-500">
            SaaS para empreiteiros e profissionais independentes da construção e remodelação —
            do primeiro contacto ao pagamento final, sem folhas soltas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className={buttonClassName("signal", "w-full sm:w-auto")}>Criar conta grátis</Link>
            <Link to="/login" className={buttonClassName("ghost", "w-full sm:w-auto")}>Já tenho conta</Link>
          </div>
        </section>

        <section className="border-y border-concrete-200 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-steel-500">
              Do primeiro contacto à obra fechada
            </h2>
            <ol className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
              {WORKFLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-full border border-concrete-300 bg-concrete-50 px-4 py-2 text-sm font-semibold text-steel-700">
                    <span className="text-signal-600">{i + 1}</span> {step}
                  </span>
                  {i < WORKFLOW.length - 1 && <span aria-hidden className="text-concrete-300">→</span>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="text-center text-3xl font-semibold text-steel-900">Feito para o terreno, não para o escritório</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Blueprint key={f.title} className="bg-white p-6">
                <h3 className="text-lg font-semibold text-steel-900">{f.title}</h3>
                <p className="mt-2 text-steel-500">{f.text}</p>
              </Blueprint>
            ))}
          </div>
        </section>

        <section className="bg-steel-700 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-concrete-50">Pronto para organizar as suas obras?</h2>
          <div className="mt-6">
            <Link to="/register" className={buttonClassName("signal")}>Criar conta grátis</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-concrete-200 py-8 text-center text-sm text-steel-500">
        © {new Date().getFullYear()} ObraOS. Menos gestão. Mais obra.
      </footer>
    </div>
  );
}
