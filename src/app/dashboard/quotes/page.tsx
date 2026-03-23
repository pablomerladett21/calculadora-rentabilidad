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
  ChevronRight,
  Clock,
  User,
  CheckCircle2
} from 'lucide-react'
import QuoteView from '@/components/dashboard/quote-view'

export default function QuotesPage() {
  const { profile } = useProfile()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<any>(null)

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

  const filteredQuotes = quotes.filter(q => 
    (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Presupuestos</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestioná y compartí cotizaciones con tus clientes</p>
        </div>
      </div>

      {/* Stats / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 mb-4">
            <Clock size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuestos Activos</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{quotes.length}</p>
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
             <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mb-8">Comenzá registrando un nuevo presupuesto desde el botón de ventas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuotes.map(quote => (
              <div 
                key={quote.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group border-l-4 border-l-indigo-500"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{quote.id.slice(0, 8)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(quote.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {quote.customer_name || 'Sin nombre'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cotizado</p>
                       <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                         {formatCurrency(quote.total_amount, quote.currency_symbol)}
                       </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700"
                      >
                        <Printer size={16} /> Ver / Imprimir
                      </button>
                      <button
                        onClick={() => convertToSale(quote)}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                      >
                        <CheckCircle2 size={16} /> Confirmar Venta
                      </button>
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="p-3 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
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
