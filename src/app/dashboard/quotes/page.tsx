'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useProfile } from '@/context/profile-context'
import { formatCurrency } from '@/lib/utils'
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  CheckCircle2,
  X
} from 'lucide-react'
import QuoteView from '@/components/dashboard/quote-view'
import SalesLogForm from '@/components/dashboard/sales-log-form'

export default function QuotesPage() {
  const { profile } = useProfile()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  
  // Nuevo estado para mostrar formulario o detalles
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotes()
  }, [])

  async function fetchQuotes() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        *,
        items:sales_order_items(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'quote')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    setQuotes(data || [])
    setLoading(false)
  }

  const deleteQuote = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return
    const { error } = await supabase.from('sales_orders').delete().eq('id', id)
    if (!error) fetchQuotes()
  }

  const convertToSale = async (quote: any) => {
    if (!confirm('¿Deseas convertir este presupuesto en una venta finalizada?')) return
    const { error } = await supabase
      .from('sales_orders')
      .update({ status: 'finalized' })
      .eq('id', quote.id)
    
    if (!error) {
       alert('¡Venta registrada con éxito!')
       fetchQuotes()
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const filteredQuotes = quotes.filter(q => 
    (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = quotes.reduce((acc, q) => acc + Number(q.total_amount || 0), 0)

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Presupuestos</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestioná y compartí cotizaciones con tus clientes</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            <Plus size={18} /> Nueva Cotización
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          <button 
            onClick={() => setShowForm(false)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-indigo-600 text-white rounded-xl"><FileText size={20} /></span>
              Crear Nuevo Presupuesto
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2 ml-14">Ingresá los productos para generar una nueva cotización.</p>
          </div>
          <SalesLogForm mode="quote" onSuccess={() => {
            setShowForm(false)
            fetchQuotes()
          }} />
        </div>
      )}

      {/* Stats / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presupuestos Activos</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{quotes.length}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/20 text-white flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-100">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Valor Total Cotizado</p>
            <p className="text-3xl font-black">{formatCurrency(totalValue, profile?.currency_symbol || '$')}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-sm outline-none"
        />
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando presupuestos...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                <FileText size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No hay presupuestos</h3>
             <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mb-8">Comenzá registrando un nuevo presupuesto desde el botón superior.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuotes.map(quote => (
              <div 
                key={quote.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Side: Info */}
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(quote.id)}>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{quote.id.slice(0, 8)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(quote.created_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{quote.items?.length || 0} ítems</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {quote.customer_name || 'Sin nombre de cliente'}
                      </h3>
                    </div>
                  </div>

                  {/* Right Side: Actions & Total */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cotizado</p>
                       <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                         {formatCurrency(quote.total_amount, quote.currency_symbol)}
                       </p>
                    </div>
                    
                    <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700"
                        title="Ver / Imprimir"
                      >
                        <Printer size={16} /> <span className="hidden md:inline">Imprimir</span>
                      </button>
                      <button
                        onClick={() => convertToSale(quote)}
                        className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                        title="Confirmar Venta"
                      >
                        <CheckCircle2 size={16} /> <span className="hidden lg:inline">Confirmar Venta</span>
                      </button>
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="p-3 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => toggleExpand(quote.id)}
                        className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                      >
                        {expandedId === quote.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Inline */}
                {expandedId === quote.id && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalle de la Cotización</p>
                    <div className="space-y-2">
                      {quote.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item.product_name}</span>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="font-medium text-slate-500">{item.quantity} x {formatCurrency(item.unit_price, quote.currency_symbol)}</span>
                            <span className="font-black text-indigo-600 dark:text-indigo-400 w-24 text-right">
                              {formatCurrency(item.total_price, quote.currency_symbol)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {quote.notes && (
                      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <p className="text-[10px] font-black text-amber-600/60 dark:text-amber-500/50 uppercase tracking-widest mb-1">Notas Adicionales</p>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200/80">{quote.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View/Print Modal */}
      {selectedQuote && (
        <QuoteView 
          quote={selectedQuote} 
          businessProfile={profile} 
          onClose={() => setSelectedQuote(null)} 
        />
      )}
    </div>
  )
}
