'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Loader2, X, Landmark } from 'lucide-react'

// Tipos de gasto disponibles
const EXPENSE_TYPES = [
  { value: 'software',  label: '💻 Herramienta / Software' },
  { value: 'utility',   label: '⚡ Servicio (Luz, Agua, Gas, etc.)' },
  { value: 'tax',       label: '🏛 Impuesto (ARBA, AFIP, Monotributo...)' },
  { value: 'insurance', label: '🛡 Seguro' },
  { value: 'rent',      label: '🏠 Alquiler' },
  { value: 'salary',    label: '👥 Sueldos / Personal' },
  { value: 'other',     label: '📦 Otro' },
]

interface SubscriptionsFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function SubscriptionsForm({ onSuccess, onCancel }: SubscriptionsFormProps) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [category, setCategory] = useState('')
  const [expenseType, setExpenseType] = useState('software')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase.from('subscriptions').insert([
        {
          user_id: user.id,
          name,
          cost: parseFloat(cost),
          billing_cycle: billingCycle,
          category,
          expense_type: expenseType,
        },
      ])

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al guardar el gasto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nuevo Gasto Fijo</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Registrá un gasto recurrente</p>
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de gasto */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Tipo de gasto</label>
          <select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
          >
            {EXPENSE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Nombre / Proveedor</label>
            <input
              type="text"
              placeholder="Ej: Edesur, AFIP, Adobe CC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-medium text-slate-950 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Costo</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-black text-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Frecuencia</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Descripción / Detalle</label>
            <input
              type="text"
              placeholder="Ej: Plan Pro, 3 empleados..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-medium text-slate-950 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-end gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Guardar Gasto
          </button>
        </div>
      </form>
    </div>
  )
}
