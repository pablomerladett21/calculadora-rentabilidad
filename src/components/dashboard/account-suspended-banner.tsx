'use client'

import { ShieldAlert } from 'lucide-react'

export default function AccountSuspendedBanner() {
  return (
    <div className="rounded-[2rem] border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 flex items-center justify-center flex-shrink-0">
          <ShieldAlert size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500 mb-2">
            Cuenta suspendida
          </p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Tu acceso de escritura fue bloqueado
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Podés seguir viendo tus datos, pero no vas a poder crear o editar productos, gastos, ventas ni stock mientras la cuenta esté suspendida.
          </p>
        </div>
      </div>
    </div>
  )
}
