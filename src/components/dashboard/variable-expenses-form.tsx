'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Truck, Package, Megaphone, Wrench, User, FileText, Calendar, DollarSign, X, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'shipping', label: 'Envíos / Fletes', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'packaging', label: 'Empaques / Materiales', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { value: 'marketing', label: 'Publicidad / Marketing', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { value: 'supplies', label: 'Insumos / Compras', icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'freelance', label: 'Freelance / Honorarios', icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'other', label: 'Otros', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
]

interface VariableExpensesFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function VariableExpensesForm({ onSuccess, onCancel }: VariableExpensesFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: 'shipping' as string,
    expense_date: today,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) { setError('El nombre del gasto es obligatorio.'); return }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Ingresá un monto válido mayor a cero.')
      return
    }
    if (!form.expense_date) { setError('La fecha del gasto es obligatoria.'); return }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No hay sesión activa.'); setSaving(false); return }

    const { error: dbError } = await supabase.from('variable_expenses').insert({
      user_id: user.id,
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      expense_date: form.expense_date,
      notes: form.notes.trim() || null,
    })

    setSaving(false)

    if (dbError) {
      setError('Error al guardar. Intentá de nuevo.')
      return
    }

    onSuccess()
  }

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category)

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900/60 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nuevo Gasto Variable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Envíos, empaques, publicidad u otros egresos puntuales.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Categoría */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categoría</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = form.category === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleChange('category', cat.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                  <cat.icon size={16} className={cat.color} />
                </div>
                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Nombre / Descripción */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Descripción *
          </label>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
            {selectedCategory && <selectedCategory.icon size={18} className={selectedCategory.color} />}
            <input
              type="text"
              placeholder={`Ej: ${form.category === 'shipping' ? 'Envíos mayo' : form.category === 'packaging' ? 'Cajas y bolsas' : 'Detalle del gasto'}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Monto */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Monto *
          </label>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
            <DollarSign size={18} className="text-slate-400 flex-shrink-0" />
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Fecha del Gasto *
          </label>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
            <Calendar size={18} className="text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => handleChange('expense_date', e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full"
            />
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Notas <span className="text-slate-300 normal-case tracking-normal font-medium">(opcional)</span>
          </label>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
            <FileText size={18} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Proveedor, referencia, detalle..."
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold">
          <X size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-60 text-sm"
        >
          <CheckCircle size={18} />
          {saving ? 'Guardando...' : 'Guardar Gasto'}
        </button>
      </div>
    </form>
  )
}
