'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, Trash2, Sparkles, TrendingUp, Calendar, BarChart3, Star, Search, Filter, History } from 'lucide-react'
import SalesLogForm from '@/components/dashboard/sales-log-form'
import { formatCurrency } from '@/lib/utils'
import { useProfile } from '@/context/profile-context'

type Range = 'day' | 'week' | 'month' | 'year' | 'all'

function startOf(unit: Range) {
  const now = new Date()
  if (unit === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  if (unit === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString()
  }
  if (unit === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  if (unit === 'year') return new Date(now.getFullYear(), 0, 1).toISOString()
  return new Date(2000, 0, 1).toISOString() // Early date for 'all'
}

export default function SalesPage() {
  const { profile } = useProfile()
  const [sales, setSales] = useState<any[]>([])
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0, year: 0 })
  const [loading, setLoading] = useState(true)
  const [filterRange, setFilterRange] = useState<Range>('day')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const uid = user.id

    // Fetch summaries always for the cards
    const [todayRes, weekRes, monthRes, yearRes, listRes] = await Promise.all([
      supabase.from('sales').select('total').eq('user_id', uid).gte('sold_at', startOf('day')),
      supabase.from('sales').select('total').eq('user_id', uid).gte('sold_at', startOf('week')),
      supabase.from('sales').select('total').eq('user_id', uid).gte('sold_at', startOf('month')),
      supabase.from('sales').select('total').eq('user_id', uid).gte('sold_at', startOf('year')),
      supabase.from('sales')
        .select('*')
        .eq('user_id', uid)
        .gte('sold_at', startOf(filterRange))
        .order('sold_at', { ascending: false }),
    ])

    const sum = (rows: any[]) => (rows || []).reduce((a, r) => a + parseFloat(r.total), 0)

    setSummary({
      today: sum(todayRes.data || []),
      week: sum(weekRes.data || []),
      month: sum(monthRes.data || []),
      year: sum(yearRes.data || []),
    })
    setSales(listRes.data || [])
    setLoading(false)
  }, [filterRange])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return
    await supabase.from('sales').delete().eq('id', id)
    fetchAll()
  }

  const filteredSales = sales.filter(s => 
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const rangeLabels: Record<Range, string> = {
    day: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    year: 'Este Año',
    all: 'Todo el Historial'
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
            <Sparkles size={16} />
            <span>Punto de Venta</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Registro de Ventas</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Registrá tus ventas y analizá el rendimiento histórico.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Hoy', value: summary.today, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Esta Semana', value: summary.week, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Este Mes', value: summary.month, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Este Año', value: summary.year, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {loading ? '...' : formatCurrency(value, profile?.currency_symbol || '$')}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                <ShoppingCart size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Nueva Venta</h2>
            </div>
            <SalesLogForm onSuccess={fetchAll} />
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20">
            <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Tip de hoy</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Mantener tus ventas al día te permite ver tendencias reales en el Dashboard y ajustar tus precios estratégicamente.
            </p>
          </div>
        </div>

        {/* History Log */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <History size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Historial de Ventas</h2>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {(['day', 'week', 'month', 'all'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRange(r)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRange === r ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {r === 'day' ? 'Hoy' : r === 'week' ? 'Sem' : r === 'month' ? 'Mes' : 'Todo'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-6 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por producto o nota..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex-1 space-y-3 min-h-[400px] overflow-y-auto pr-2">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))
            ) : filteredSales.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                <ShoppingCart size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">No se encontraron ventas</p>
                <p className="text-xs mt-1">Probá cambiando el filtro o registrando una nueva.</p>
              </div>
            ) : (
              filteredSales.map(sale => (
                <div key={sale.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-sm text-slate-900 dark:text-white">{sale.product_name}</p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded uppercase">
                          {new Date(sale.sold_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {sale.quantity} unid. × {formatCurrency(sale.sale_price, profile?.currency_symbol || '$')}
                        {sale.notes && <span className="ml-2 italic text-indigo-500/70">· {sale.notes}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(sale.total, profile?.currency_symbol || '$')}</p>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mostrando: <span className="text-indigo-600">{rangeLabels[filterRange]}</span>
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Total: {formatCurrency(filteredSales.reduce((a, s) => a + parseFloat(s.total), 0), profile?.currency_symbol || '$')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
