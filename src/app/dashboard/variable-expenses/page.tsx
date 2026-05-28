'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Truck, Package, Megaphone, Wrench, User, FileText,
  Plus, Trash2, Edit2, Search, Filter, TrendingDown,
  Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useProfile } from '@/context/profile-context'
import VariableExpensesForm from '@/components/dashboard/variable-expenses-form'
import EditVariableExpenseModal from '@/components/dashboard/edit-variable-expense-modal'
import type { VariableExpenseRecord } from '@/lib/app-types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

// ─── Configuración de categorías ───────────────────────────────────────────
const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: TrendingDown, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { value: 'shipping', label: 'Envíos', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'packaging', label: 'Empaques', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { value: 'marketing', label: 'Publicidad', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { value: 'supplies', label: 'Insumos', icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'freelance', label: 'Freelance', icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'other', label: 'Otros', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
]

function getCategoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}

// ─── Helpers de fecha ──────────────────────────────────────────────────────
function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function VariableExpensesPage() {
  const { profile } = useProfile()
  const sym = profile?.currency_symbol ?? '$'

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed
  const [allExpenses, setAllExpenses] = useState<VariableExpenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingExpense, setEditingExpense] = useState<VariableExpenseRecord | null>(null)

  // ── Fetch: todos los gastos del usuario (para calcular tendencia 6 meses) ──
  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAllExpenses([]); setLoading(false); return }

    const sixMonthsAgo = new Date(viewYear, viewMonth - 5, 1).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('variable_expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('expense_date', sixMonthsAgo)
      .order('expense_date', { ascending: false })

    if (!error) setAllExpenses((data as VariableExpenseRecord[]) || [])
    setLoading(false)
  }, [viewMonth, viewYear])

  useEffect(() => { void fetchExpenses() }, [fetchExpenses])

  // ── Navegar entre meses ───────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()
    if (isCurrentMonth) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  // ── Filtrar gastos del mes activo ─────────────────────────────────────────
  const monthExpenses = allExpenses.filter((e) => {
    const d = new Date(e.expense_date + 'T00:00:00')
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })

  const filteredExpenses = monthExpenses.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalMonth = filteredExpenses.reduce((acc, e) => acc + parseFloat(String(e.amount)), 0)

  // ── Total mes anterior (para comparativa) ─────────────────────────────────
  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
  const prevM = viewMonth === 0 ? 11 : viewMonth - 1
  const prevMonthTotal = allExpenses
    .filter((e) => {
      const d = new Date(e.expense_date + 'T00:00:00')
      return d.getFullYear() === prevY && d.getMonth() === prevM
    })
    .reduce((acc, e) => acc + parseFloat(String(e.amount)), 0)

  const diff = totalMonth - prevMonthTotal
  const diffPct = prevMonthTotal > 0 ? (diff / prevMonthTotal) * 100 : null

  // ── Datos para gráfico de barras (últimos 6 meses) ────────────────────────
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(viewYear, viewMonth - 5 + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const total = allExpenses
      .filter((e) => {
        const ed = new Date(e.expense_date + 'T00:00:00')
        return ed.getFullYear() === y && ed.getMonth() === m
      })
      .reduce((acc, e) => acc + parseFloat(String(e.amount)), 0)
    return {
      label: d.toLocaleDateString('es-AR', { month: 'short' }),
      total,
    }
  })

  // ── Breakdown por categoría ───────────────────────────────────────────────
  const categoryBreakdown = CATEGORIES.filter((c) => c.value !== 'all').map((cat) => {
    const total = filteredExpenses
      .filter((e) => e.category === cat.value)
      .reduce((acc, e) => acc + parseFloat(String(e.amount)), 0)
    return { ...cat, total }
  }).filter((c) => c.total > 0)

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('variable_expenses').delete().eq('id', id)
    void fetchExpenses()
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gastos Variables</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Envíos, empaques, publicidad y otros egresos que varían mes a mes.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            Nuevo Gasto
          </button>
        )}
      </div>

      {/* ── Formulario inline ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="animate-in zoom-in-95 duration-300">
          <VariableExpensesForm
            onSuccess={() => { setShowForm(false); void fetchExpenses() }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── Navegador de mes ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={prevMonth}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-lg font-black capitalize text-slate-900 dark:text-white">{monthLabel(viewYear, viewMonth)}</span>
        </div>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Layout principal: lista + sidebar ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Lista ──────────────────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Barra de búsqueda y filtro */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 w-full group focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600" />
                <input
                  type="text"
                  placeholder="Buscar gasto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm dark:text-slate-300 w-full font-medium"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-none outline-none text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer rounded-lg px-2 py-1"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-20 text-center text-slate-400 font-medium animate-pulse">Cargando gastos...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <TrendingDown size={32} className="text-slate-300 dark:text-slate-700" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'No hay gastos para los filtros aplicados.'
                      : `Sin gastos registrados en ${monthLabel(viewYear, viewMonth)}.`}
                  </p>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                      className="text-indigo-600 font-bold hover:underline py-2"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                filteredExpenses.map((expense) => {
                  const meta = getCategoryMeta(expense.category)
                  const d = new Date(expense.expense_date + 'T00:00:00')
                  const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

                  return (
                    <div
                      key={expense.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${meta.bg} ${meta.color}`}>
                          <meta.icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{expense.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md dark:bg-indigo-900/40 dark:text-indigo-300">
                              {meta.label}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                              <Calendar size={12} />
                              {dateStr}
                            </span>
                            {expense.notes && (
                              <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px] italic">
                                {expense.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(Number(expense.amount), sym)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Puntual</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setEditingExpense(expense)}
                            className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all dark:hover:bg-indigo-900/20"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* KPI: Total del mes */}
          <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingDown size={14} /> Total del Mes
              </h3>
              <p className="text-5xl font-black mt-3">{formatCurrency(totalMonth, sym)}</p>
              <p className="text-indigo-200/80 text-sm mt-2 font-medium italic capitalize">{monthLabel(viewYear, viewMonth)}</p>

              <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Mes Anterior</p>
                  <p className="text-2xl font-black">{formatCurrency(prevMonthTotal, sym)}</p>
                </div>
                {diffPct !== null && (
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black ${diff > 0 ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                    {diff > 0 ? '+' : ''}{diffPct.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown por categoría */}
          {categoryBreakdown.length > 0 && (
            <div className="p-8 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-black text-slate-900 dark:text-white mb-5 text-base">Por Categoría</h4>
              <div className="space-y-3">
                {categoryBreakdown.map((cat) => {
                  const pct = totalMonth > 0 ? (cat.total / totalMonth) * 100 : 0
                  return (
                    <div key={cat.value}>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cat.bg}`}>
                            <cat.icon size={12} className={cat.color} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(cat.total, sym)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Gráfico de tendencia — últimos 6 meses */}
          <div className="p-8 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-black text-slate-900 dark:text-white mb-6 text-base">Tendencia 6 Meses</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0), sym), 'Gastos']}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tips */}
          <div className="p-8 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingDown size={64} />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white mb-6 text-lg">Tips de Gestión</h4>
            <ul className="space-y-4">
              {[
                'Registrá cada envío para saber cuánto te cuesta despachar por mes.',
                'Compará los empaques vs el volumen de ventas para ajustar tu precio.',
                'Tener los gastos variables por mes te ayuda a proyectar tu rentabilidad real.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Modal de edición ───────────────────────────────────────────────── */}
      {editingExpense && (
        <EditVariableExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => { void fetchExpenses() }}
        />
      )}
    </div>
  )
}
