import Link from 'next/link'
import {
  ArrowRight,
  Boxes,
  Calculator,
  Check,
  FileText,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

const highlights = [
  '15 dias gratis, sin tarjeta',
  'Luego USD 12/mes',
  'Hecho para talleres que venden por presupuesto',
]

const benefits = [
  {
    title: 'Mas margen, menos dudas',
    description: 'Calcula el precio sugerido y ve en segundos cuanto deja cada producto.',
    icon: TrendingUp,
  },
  {
    title: 'Stock bajo control',
    description: 'Registra entradas, salidas y alertas para evitar vender sin stock.',
    icon: Boxes,
  },
  {
    title: 'Presupuestos que cierran',
    description: 'Arma cotizaciones y conviertelas en ventas con un clic.',
    icon: FileText,
  },
  {
    title: 'Gastos visibles',
    description: 'Ves tus gastos fijos y sabes rapido si tu negocio realmente gana plata.',
    icon: Calculator,
  },
]

const steps = [
  {
    title: 'Carga tu negocio',
    description: 'Nombre, moneda y datos basicos para arrancar en minutos.',
  },
  {
    title: 'Carga productos y gastos',
    description: 'Importa CSV o cargalos a mano si todavia estas ordenando todo.',
  },
  {
    title: 'Vende con margen',
    description: 'Crea presupuestos, registra ventas y sigue el stock automaticamente.',
  },
]

const faqs = [
  {
    q: 'Necesito tarjeta para probar?',
    a: 'No. Tenes 15 dias gratis para probar todo el flujo antes de pagar.',
  },
  {
    q: 'Sirve para talleres?',
    a: 'Si, ese es el foco inicial: margen, stock, presupuestos y produccion chica.',
  },
  {
    q: 'Puedo usarla desde el celular?',
    a: 'Si. La experiencia esta pensada para vender, cargar y revisar datos desde movil o PC.',
  },
  {
    q: 'Puedo importar Excel o CSV?',
    a: 'Si. Puedes importar productos y gastos para arrancar mas rapido.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.15),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_26%),linear-gradient(to_bottom,_#ffffff,_#f8fafc_45%,_#eef2ff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.25),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(to_bottom,_#020617,_#0f172a_55%,_#111827_100%)] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 px-4 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <div className="leading-none">
              <p className="text-base font-black uppercase tracking-[0.22em] text-indigo-500 sm:text-lg sm:tracking-[0.32em]">
                BizTracker ROI
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-300 sm:text-xs md:text-sm">
                Mas ventas. Mas margen. Menos caos.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/login?redirect=/dashboard"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 sm:flex-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Entrar
            </Link>
            <Link
              href="/register?redirect=/dashboard"
              className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 sm:flex-none"
            >
              Probar gratis
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-7 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-indigo-600 shadow-sm dark:border-indigo-900/40 dark:bg-slate-950/80 dark:text-indigo-300">
              <ShieldCheck size={14} />
              15 dias gratis sin tarjeta
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
                Vende con margen, controla tu stock y entiende en minutos si tu taller esta ganando plata.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                Una app simple para talleres y negocios de produccion que quieren dejar Excel, cerrar presupuestos mas rapido y ordenar su flujo de trabajo sin perder ventas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register?redirect=/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-700 sm:w-auto"
              >
                Empezar gratis hoy
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#precio"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50 sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Ver plan y precio
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 right-8 h-28 w-28 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-4 shadow-2xl sm:p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500">Vista previa</p>
                  <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white sm:text-xl">Tu negocio en numeritos que si importan</h2>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  Listo para vender
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PreviewCard label="Ventas hoy" value="$84.500" tone="emerald" />
                <PreviewCard label="Margen medio" value="31.8%" tone="indigo" />
                <PreviewCard label="Stock bajo" value="4 productos" tone="amber" />
                <PreviewCard label="Presupuestos" value="12 activos" tone="slate" />
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  <MessageCircleMore size={14} />
                  Flujo rapido
                </div>
                <div className="mt-3 space-y-3">
                  <PreviewFlowStep text="Carga un producto" />
                  <PreviewFlowStep text="Crea un presupuesto" />
                  <PreviewFlowStep text="Convierte a venta y baja stock" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="py-8 lg:py-12">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Beneficios</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">
              Menos Excel. Mas margen. Mas control sobre lo que realmente importa.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <article
                  key={benefit.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{benefit.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="como-funciona" className="py-14 lg:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Como funciona</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">
              Empezas ordenado en tres pasos y empezas a vender mejor.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="precio" className="py-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Precio simple</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Un solo plan para empezar hoy y seguir solo si te hace ganar mas.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Proba todo gratis durante 15 dias, sin tarjeta. Si te sirve, seguis con el plan pago de USD 12/mes.
              </p>
              <div className="mt-8 rounded-[1.75rem] bg-slate-950 p-6 text-white dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Plan unico</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tight sm:text-5xl">USD 12</span>
                  <span className="pb-1 text-sm font-bold text-slate-400">/ mes</span>
                </div>
                <div className="mt-5 space-y-3 text-sm text-slate-200">
                  <PriceLine text="15 dias gratis sin tarjeta" />
                  <PriceLine text="Presupuestos que venden" />
                  <PriceLine text="Stock, margen y gastos" />
                  <PriceLine text="Importacion CSV" />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-2xl shadow-indigo-500/20 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100/80">Para talleres</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Si hoy vendes por WhatsApp, esta app te ayuda a cerrar mas rapido y con mas margen.
              </h2>
              <p className="mt-3 text-sm leading-7 text-indigo-100/90">
                La propuesta esta pensada para negocios chicos que necesitan saber que producto deja margen, cuanto stock queda y que presupuesto conviene empujar primero.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {['Mas margen', 'Stock critico', 'Ventas del dia', 'Gastos visibles'].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold">
                    <Check size={16} className="text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/register?redirect=/dashboard"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-indigo-700 transition hover:bg-indigo-50"
              >
                Probar sin tarjeta
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="py-12 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Preguntas frecuentes</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">
              Las dudas que frenan la compra antes de probar.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm open:shadow-md dark:border-slate-800 dark:bg-slate-950"
              >
                <summary className="cursor-pointer list-none text-lg font-black text-slate-950 dark:text-white">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-8 text-center shadow-sm sm:px-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Listo para empezar</p>
            <h2 className="mx-auto mt-2 max-w-3xl text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">
              Deja de adivinar si tu taller gana plata. Miralo en numeros y arranca hoy.
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register?redirect=/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
              >
                Quiero probar gratis
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login?redirect=/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Entrar a mi cuenta
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function PreviewCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'emerald' | 'indigo' | 'amber' | 'slate'
}) {
  const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  }[tone]

  return (
    <div className={`rounded-[1.25rem] p-4 ${toneClasses}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
    </div>
  )
}

function PreviewFlowStep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        ✓
      </span>
      {text}
    </div>
  )
}

function PriceLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check size={16} className="text-emerald-300" />
      <span>{text}</span>
    </div>
  )
}
