'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LayoutGrid, List, Package, Trash2, ArrowRight, Search, Edit2, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import EditProductModal from '@/components/dashboard/edit-product-modal'
import { useProfile } from '@/context/profile-context'

export default function CatalogPage() {
  const { profile } = useProfile()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [productsRes, salesRes] = await Promise.all([
      supabase.from('products_roi').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('sales').select('product_id').eq('user_id', user.id)
    ])
    
    if (!productsRes.error) {
      const salesCounts: Record<string, number> = {}
      salesRes.data?.forEach(s => {
        if (s.product_id) salesCounts[s.product_id] = (salesCounts[s.product_id] || 0) + 1
      })
      
      const productsWithSales = (productsRes.data || []).map(p => ({
        ...p,
        sales_count: salesCounts[p.id] || 0
      }))
      
      setProducts(productsWithSales)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto del catálogo?')) return
    const { error } = await supabase.from('products_roi').delete().eq('id', id)
    if (!error) fetchProducts()
  }

  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const exportToCSV = () => {
    const headers = ['Producto,Costo Material,Horas,Precio Sugerido,Margen %,Ventas Totales']
    const rows = products.map(p => 
      `"${p.product_name}",${p.material_cost},${p.time_invested_hours},${p.suggested_price},${p.desired_margin_percent}%,${p.sales_count}`
    )
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "biztracker_catalogo_productos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
            <Sparkles size={16} />
            <span>Gestión de Inventario</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Catálogo de Productos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Visualiza y gestiona todos tus productos analizados.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Package size={22} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tus Productos</h2>
          </div>

          <div className="flex flex-1 max-w-md items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 dark:text-white outline-none"
              />
            </div>

            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <ArrowRight size={16} className="rotate-90" />
              CSV
            </button>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl dark:bg-slate-800 shadow-inner">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Cargando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center bg-white dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Package size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-400 font-medium">
              {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : 'Aún no tienes productos guardados en tu catálogo.'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group relative bg-white dark:bg-slate-900/40 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 dark:bg-indigo-900/20 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    <Package size={28} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white truncate pr-10 tracking-tight">{product.product_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">Costo</span>
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {formatCurrency(product.material_cost + (product.time_invested_hours * product.hourly_rate), profile?.currency_symbol || '$')}
                          </p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 bg-indigo-600 px-2 py-0.5 rounded">Ventas</span>
                          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {product.sales_count}
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">Precio Sugerido</p>
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                        {formatCurrency(product.suggested_price, profile?.currency_symbol || '$')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black">Margen</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{product.desired_margin_percent}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-12">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-xl transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Package size={24} />
                   </div>
                   <div>
                      <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{product.product_name}</h3>
                      <p className="text-xs font-bold text-slate-400">Costo: {formatCurrency(product.material_cost + (product.time_invested_hours * product.hourly_rate), profile?.currency_symbol || '$')}</p>
                   </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Sugerido</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(product.suggested_price, profile?.currency_symbol || '$')}</p>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Ventas</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{product.sales_count}</p>
                  </div>
                  <div className="w-20 text-center py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                    <p className="text-sm font-black text-emerald-600">{product.desired_margin_percent}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                      title="Editar Producto"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSuccess={fetchProducts} 
        />
      )}
    </div>
  )
}
