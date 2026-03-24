'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Landmark, Trash2, Calendar, Search, Filter, ArrowRight, Edit2, Zap, Monitor, Building2, User, Box, FileText, Shield } from 'lucide-react'
import Link from 'next/link'
import SubscriptionsForm from '@/components/dashboard/subscriptions-form'
import { formatCurrency } from '@/lib/utils'
import EditSubscriptionModal from '@/components/dashboard/edit-subscription-modal'

const EXPENSE_TYPES = [
  { value: 'all',       label: 'Todas las Categorías', icon: Landmark },
  { value: 'software',  label: 'Herramienta / Software', icon: Monitor },
  { value: 'utility',   label: 'Servicios', icon: Zap },
  { value: 'tax',       label: 'Impuestos', icon: Building2 },
  { value: 'insurance', label: 'Seguros', icon: Shield },
  { value: 'rent',      label: 'Alquiler', icon: Box },
  { value: 'salary',    label: 'Sueldos / Personal', icon: User },
  { value: 'other',     label: 'Otros', icon: FileText },
]

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpenseType, setSelectedExpenseType] = useState<string>('all')
  const [editingSubscription, setEditingSubscription] = useState<any | null>(null)

  const fetchSubscriptions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setSubscriptions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto fijo?')) return
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (!error) fetchSubscriptions()
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (sub.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    // Por retrocompatibilidad, si no tiene expense_type, lo tratamos como 'software'
    const subType = sub.expense_type || 'software'
    const matchesCategory = selectedExpenseType === 'all' || subType === selectedExpenseType
    
    return matchesSearch && matchesCategory
  })

  const totalMonthly = filteredSubscriptions.reduce((acc, sub) => {
    const cost = parseFloat(sub.cost)
    return acc + (sub.billing_cycle === 'yearly' ? cost / 12 : cost)
  }, 0)

  const exportToCSV = () => {
    const headers = ['Nombre,Costo,Ciclo,Categoría,Tipo de Gasto,Creado']
    const rows = subscriptions.map(sub => 
      `"${sub.name}",${sub.cost},${sub.billing_cycle},"${sub.category || ''}","${sub.expense_type || 'software'}",${new Date(sub.created_at).toLocaleDateString()}`
    )
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "biztracker_gastos_fijos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper para obtener el ícono y color basado en el tipo de gasto
  const getIconForExpenseType = (type: string) => {
    const t = type || 'software'
    switch (t) {
      case 'software':  return { Icon: Monitor, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' }
      case 'utility':   return { Icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
      case 'tax':       return { Icon: Building2, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' }
      case 'insurance': return { Icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
      case 'rent':      return { Icon: Box, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
      case 'salary':    return { Icon: User, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' }
      default:          return { Icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' }
    }
  }

  const getLabelForExpenseType = (type: string) => {
    const t = type || 'software'
    const found = EXPENSE_TYPES.find(x => x.value === t)
    return found ? found.label : 'Otro'
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gastos Fijos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Gestiona sueldos, alquileres, servicios y suscripciones de software.</p>
        </div>
        {!showForm && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 text-sm"
            >
              <Plus size={20} />
              Nuevo Gasto
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <ArrowRight size={16} className="rotate-90" />
              CSV
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="animate-in zoom-in-95 duration-300">
          <SubscriptionsForm 
            onSuccess={() => {
              setShowForm(false)
              fetchSubscriptions()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 w-full group focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600" />
                <input 
                  type="text" 
                  placeholder="Buscar proveedor o detalle..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm dark:text-slate-300 w-full font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={18} className="text-slate-400" />
                <select 
                  value={selectedExpenseType}
                  onChange={(e) => setSelectedExpenseType(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-none outline-none text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer rounded-lg px-2 py-1"
                >
                  {EXPENSE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-20 text-center text-slate-400 font-medium animate-pulse">Cargando gastos fijos...</div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <Landmark size={32} className="text-slate-300 dark:text-slate-700" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    {searchQuery || selectedExpenseType !== 'all' ? 'No se encontraron resultados para los filtros aplicados.' : 'No tenés gastos fijos registrados aún.'}
                  </p>
                  {(searchQuery || selectedExpenseType !== 'all') && (
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedExpenseType('all'); }}
                      className="text-indigo-600 font-bold hover:underline py-2"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const { Icon, color, bg } = getIconForExpenseType(sub.expense_type)
                  
                  return (
                    <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${bg} ${color}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{sub.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md dark:bg-indigo-900/40 dark:text-indigo-300">
                              {getLabelForExpenseType(sub.expense_type)}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400 capitalize">
                              <Calendar size={12} />
                              {sub.billing_cycle === 'monthly' ? 'Mensual' : 'Anual'}
                            </span>
                            {sub.category && (
                              <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">
                                · {sub.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(sub.cost)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.billing_cycle}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setEditingSubscription(sub)}
                            className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all dark:hover:bg-indigo-900/20"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sub.id)}
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

        <div className="space-y-8">
          <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <h3 className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Landmark size={14} /> Gastos Proyectados
              </h3>
              <p className="text-5xl font-black mt-3">{formatCurrency(totalMonthly)}</p>
              <p className="text-indigo-200/80 text-sm mt-2 font-medium italic">Presupuesto mensual estimado</p>
              
              <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-center group">
                <div>
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Total Anual</p>
                  <p className="text-2xl font-black">{formatCurrency(totalMonthly * 12)}</p>
                </div>
                <Link 
                  href="/dashboard"
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                >
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Landmark size={64} />
             </div>
             <h4 className="font-black text-slate-900 dark:text-white mb-6 text-lg">Tips para Gastos Fijos</h4>
             <ul className="space-y-4">
               {[
                 "Identificá y da de baja servicios que no estás utilizando.",
                 "Pagá anualmente software y seguros para obtener descuentos.",
                 "Revisá el impacto de rentas y sueldos en tu rentabilidad."
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

      {editingSubscription && (
        <EditSubscriptionModal 
          subscription={editingSubscription} 
          onClose={() => setEditingSubscription(null)} 
          onSuccess={fetchSubscriptions} 
        />
      )}
    </div>
  )
}
