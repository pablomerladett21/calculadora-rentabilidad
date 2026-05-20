'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Package, FileText, ShoppingCart, X } from 'lucide-react'

const STORAGE_KEY = 'biztracker_onboarding_seen_v1'

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) !== '1'
  })

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="rounded-[2rem] border border-indigo-200 bg-indigo-50/70 dark:bg-indigo-900/10 dark:border-indigo-800/40 p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Primeros pasos</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">En 3 pasos ya puedes probar la app con tu negocio.</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Empieza por crear un producto, luego agrega un gasto fijo y termina con una venta o presupuesto.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="p-2.5 rounded-xl text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800 transition-all"
          aria-label="Cerrar onboarding"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <StepCard
          icon={Package}
          title="1. Crea tu primer producto"
          description="Define costo, margen y stock para ver el precio sugerido."
          href="/dashboard/roi-calc"
          cta="Ir a Producto"
        />
        <StepCard
          icon={FileText}
          title="2. Agrega un gasto fijo"
          description="Carga alquiler, sueldos o software para ver tu costo mensual."
          href="/dashboard/subscriptions"
          cta="Ir a Gastos"
        />
        <StepCard
          icon={ShoppingCart}
          title="3. Registra una venta"
          description="Crea un presupuesto o una venta y mira cómo cambia tu stock."
          href="/dashboard/sales"
          cta="Ir a Ventas"
        />
      </div>
    </div>
  )
}

function StepCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ComponentType<{ size?: number }>
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-white/80 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
        <Icon size={20} />
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
