'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Package, Settings, ShoppingCart, Sparkles } from 'lucide-react'
import { useProfile } from '@/context/profile-context'
import BusinessProfileForm from '@/components/dashboard/business-profile-form'
import type { BusinessProfileRecord } from '@/lib/app-types'

export default function SettingsPage() {
  const { profile, updateProfileState } = useProfile()

  const handleSaved = (newProfile: BusinessProfileRecord) => {
    updateProfileState(newProfile)
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
            <Sparkles size={16} />
            <span>Configuracion inicial</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Completa tu negocio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Deja listo el nombre, la moneda y los datos de contacto antes de empezar a cargar productos y ventas.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver al resumen
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-8 items-start">
        <div className="bg-white dark:bg-slate-900/40 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Perfil del negocio</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tu nombre, logo y moneda aparecen en toda la app.</p>
            </div>
          </div>

          <BusinessProfileForm profile={profile} onSaved={handleSaved} />
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[2rem] border border-indigo-200 bg-indigo-50/70 dark:bg-indigo-900/10 dark:border-indigo-800/40 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Objetivo</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Que la app te muestre valor en 5 minutos.</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Una vez que guardes esto, ya podras crear tu primer producto y empezar a medir rentabilidad.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-black text-slate-900 dark:text-white mb-4">Siguiente paso recomendado</h4>
            <div className="space-y-3">
              <Step href="/dashboard/roi-calc" icon={Package} title="Crear primer producto" />
              <Step href="/dashboard/subscriptions" icon={ShoppingCart} title="Agregar gasto fijo" />
              <Step href="/dashboard/sales" icon={CheckCircle2} title="Registrar venta" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({
  href,
  icon: Icon,
  title,
}: {
  href: string
  icon: React.ComponentType<{ size?: number }>
  title: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Icon size={18} />
        </div>
        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{title}</span>
      </div>
      <ArrowLeft size={14} className="rotate-180 text-slate-400" />
    </Link>
  )
}
