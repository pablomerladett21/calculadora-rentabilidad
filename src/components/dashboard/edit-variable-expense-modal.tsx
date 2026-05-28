'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Truck, Package, Megaphone, Wrench, User, FileText, Calendar, DollarSign, X, CheckCircle } from 'lucide-react'
import type { VariableExpenseRecord } from '@/lib/app-types'

const CATEGORIES = [
  { value: 'shipping', label: 'Envíos / Fletes', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'packaging', label: 'Empaques / Materiales', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { value: 'marketing', label: 'Publicidad / Marketing', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { value: 'supplies', label: 'Insumos / Compras', icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'freelance', label: 'Freelance / Honorarios', icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'other', label: 'Otros', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
]

interface EditVariableExpenseModalProps {
  expense: VariableExpenseRecord
  onClose: () => void
  onSuccess: () => void
}

export default function EditVariableExpenseModal({ expense, onClose, onSuccess }: EditVariableExpenseModalProps) {
  const [form, setForm] = useState({
    name: expense.name,
    amount: String(expense.amount),
    category: expense.category,
    expense_date: expense.expense_date,
    notes: expense.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

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
    if (!form.expense_date) { setError('La fecha es obligatoria.'); return }

    setSaving(true)

    const { error: dbError } = await supabase
      .from('variable_expenses')
      .update({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        expense_date: form.expense_date,
        notes: form.notes.trim() || null,
      })
      .eq('id', expense.id)

    setSaving(false)

    if (dbError) {
      setError('Error al guardar. Intentá de nuevo.')
      return
    }

    onSuccess()
    onClose()
  }

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Editar Gasto</h2>
            <p className="text-sm text-slate-500 mt-1">Modificá los datos del gasto variable.</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Categoría */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categoría</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = form.category === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleChange('category', cat.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white dark:bg-slate-900/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                      <cat.icon size={14} className={cat.color} />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descripción *</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
                {selectedCategory && <selectedCategory.icon size={16} className={selectedCategory.color} />}
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full"
                />
              </div>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Monto *</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
                <DollarSign size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full"
                />
              </div>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha *</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
                <Calendar size={16} className="text-slate-400 flex-shrink-0" />
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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Notas <span className="text-slate-300 normal-case tracking-normal font-medium">(opcional)</span></label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
                <FileText size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Proveedor, referencia..."
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

          <div className="flex gap-4 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
