'use client'

import { Sparkles, Package, ArrowRight } from 'lucide-react'
import RoiForm from '@/components/dashboard/roi-form'
import Link from 'next/link'

export default function RoiCalcPage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
            <Sparkles size={16} />
            <span>Optimizador de Precios</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Calculadora ROI</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Define precios justos para tus productos y protege tus márgenes.</p>
        </div>
        
        <Link 
          href="/dashboard/catalog"
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
        >
          <Package size={18} className="text-indigo-600" />
          Ver Catálogo
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <RoiForm onSuccess={() => {}} />
      </div>
      
      <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] dark:bg-indigo-900/10 dark:border-indigo-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
               <Package size={28} />
            </div>
            <div>
               <p className="text-lg font-black text-slate-900 dark:text-white">¿Quieres ver todos tus análisis?</p>
               <p className="text-sm font-medium text-slate-500 dark:text-indigo-300/60">Gestiona, edita y exporta tus productos en el catálogo central.</p>
            </div>
         </div>
         <Link 
            href="/dashboard/catalog" 
            className="px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
         >
            Ir al Catálogo
         </Link>
      </div>
    </div>
  )
}
