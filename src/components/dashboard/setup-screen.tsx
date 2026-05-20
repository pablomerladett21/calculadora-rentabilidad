'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Package, Settings, ShoppingCart, Sparkles } from 'lucide-react'
import type { BusinessProfileRecord } from '@/lib/app-types'

interface SetupScreenProps {
  profile: BusinessProfileRecord | null
  productCount: number
  hasExpenses: boolean
  hasSales: boolean
}

export default function SetupScreen({ profile, productCount, hasExpenses, hasSales }: SetupScreenProps) {
  const businessReady = Boolean(profile?.business_name)
  const productReady = productCount > 0
  const salesReady = hasSales
  const completed = [businessReady, productReady, salesReady].filter(Boolean).length
  const total = 3

  return (
    <div className="rounded-[2.5rem] border border-indigo-200 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50 via-white to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 md:p-10 shadow-sm overflow-hidden relative">
      <div className="absolute -top-16 -right-12 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-56 h-56 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
              <Sparkles size={16} />
              <span>Primer arranque</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Completa tu negocio en 3 pasos y empieza a vender con control.
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-base md:text-lg">
              Configura tu marca, agrega tu primer producto y registra tu primera venta para que la app te muestre datos reales de rentabilidad.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 shadow-sm min-w-[220px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progreso</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{completed}/{total}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard
            icon={Settings}
            title="1. Completa tu negocio"
            description="Pon nombre, logo y moneda para que todo salga con tu marca."
            done={businessReady}
            href="/dashboard/settings"
            cta="Abrir configuracion"
          />
          <StepCard
            icon={Package}
            title="2. Carga tu primer producto"
            description="Define costo, margen y stock para ver el precio sugerido."
            done={productReady}
            href="/dashboard/roi-calc"
            cta="Crear producto"
          />
          <StepCard
            icon={ShoppingCart}
            title="3. Registra una venta"
            description={`Convierte un presupuesto en venta y revisa stock y caja. ${hasExpenses ? 'Tus gastos ya estan listos.' : 'Luego agrega gastos fijos para completar costos.'}`}
            done={salesReady}
            href="/dashboard/sales"
            cta="Ir a ventas"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Recomendacion:
            </p>
            <p className="mt-1">
              Empieza por la configuracion y el primer producto. Con eso ya vas a ver el valor de la app.
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            Configurar ahora
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function StepCard({
  icon: Icon,
  title,
  description,
  done,
  href,
  cta,
}: {
  icon: React.ComponentType<{ size?: number }>
  title: string
  description: string
  done: boolean
  href: string
  cta: string
}) {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 rounded-[2rem] border border-white/70 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Icon size={20} />
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <CheckCircle2 size={12} /> Listo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            Pendiente
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-black text-slate-900 dark:text-white text-sm">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        {cta}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
