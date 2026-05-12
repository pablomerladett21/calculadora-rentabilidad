'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Boxes, PackagePlus, PackageMinus, SlidersHorizontal, Search, AlertTriangle, TrendingDown, Package, Sparkles } from 'lucide-react'
import AdjustStockModal from '@/components/dashboard/adjust-stock-modal'
import type { ProductRecord } from '@/lib/app-types'

interface StockMovementRecord {
  id: string
  product_id: string | null
  movement_type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string | null
  created_at: string
  products_roi: Array<{
    product_name: string
  }> | null
}

function StockBadge({ stock, threshold }: { stock: number, threshold: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Sin stock
      </span>
    )
  }

  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Bajo stock
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />En stock
    </span>
  )
}

const MOVEMENT_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  in: { label: 'Entrada', icon: <PackagePlus size={14} />, color: 'text-emerald-600' },
  out: { label: 'Salida', icon: <PackageMinus size={14} />, color: 'text-red-500' },
  adjustment: { label: 'Correccion', icon: <SlidersHorizontal size={14} />, color: 'text-amber-500' },
}

export default function StockPage() {
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [movements, setMovements] = useState<StockMovementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adjustingProduct, setAdjustingProduct] = useState<ProductRecord | null>(null)
  const [selectedProductFilter, setSelectedProductFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    async function fetchData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        if (!active) return
        setProducts([])
        setMovements([])
        setLoading(false)
        return
      }

      const [productsRes, movementsRes] = await Promise.all([
        supabase
          .from('products_roi')
          .select('id, user_id, product_name, material_cost, time_invested_hours, hourly_rate, desired_margin_percent, suggested_price, stock_quantity, stock_alert_threshold, created_at')
          .eq('user_id', user.id)
          .order('product_name'),
        supabase
          .from('stock_movements')
          .select('id, product_id, movement_type, quantity, reason, created_at, products_roi(product_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      if (!active) return

      setProducts((productsRes.data as ProductRecord[]) || [])
      setMovements((movementsRes.data as StockMovementRecord[]) || [])
      setLoading(false)
    }

    void fetchData()

    return () => {
      active = false
    }
  }, [refreshKey])

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredMovements = selectedProductFilter
    ? movements.filter((movement) => movement.product_id === selectedProductFilter)
    : movements

  const noStockCount = products.filter((product) => (product.stock_quantity ?? 0) === 0).length
  const lowStockCount = products.filter((product) => {
    const stock = product.stock_quantity ?? 0
    const threshold = product.stock_alert_threshold ?? 5
    return stock > 0 && stock <= threshold
  }).length
  const totalUnits = products.reduce((sum, product) => sum + (product.stock_quantity ?? 0), 0)

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
          <Sparkles size={16} />
          <span>Inventario</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Control de Stock</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Monitorea el inventario y el historial de movimientos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Package size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unidades</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{totalUnits.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bajo Stock</p>
            <p className="text-3xl font-black text-amber-500">{lowStockCount}</p>
            <p className="text-xs text-slate-400 font-medium">productos</p>
          </div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sin Stock</p>
            <p className="text-3xl font-black text-red-500">{noStockCount}</p>
            <p className="text-xs text-slate-400 font-medium">productos</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Boxes size={22} className="text-indigo-600" />
            Inventario de Productos
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium animate-pulse">Cargando inventario...</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Stock</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Umbral</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">No se encontraron productos.</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{product.product_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{product.stock_quantity ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{product.stock_alert_threshold ?? 5}</td>
                      <td className="px-6 py-4 text-center">
                        <StockBadge stock={product.stock_quantity ?? 0} threshold={product.stock_alert_threshold ?? 5} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setAdjustingProduct(product)}
                          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Historial de Movimientos</h2>
          <select
            value={selectedProductFilter}
            onChange={(event) => setSelectedProductFilter(event.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none"
          >
            <option value="">Todos los productos</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.product_name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">Sin movimientos registrados aun.</td>
                </tr>
              ) : (
                filteredMovements.map((movement) => {
                  const meta = MOVEMENT_LABELS[movement.movement_type]
                  return (
                    <tr key={movement.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 text-xs text-slate-400 font-medium">
                        {new Date(movement.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3 font-bold text-slate-700 dark:text-slate-300">
                        {movement.products_roi?.[0]?.product_name || '-'}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest ${meta?.color}`}>
                          {meta?.icon}{meta?.label}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-center text-lg font-black ${meta?.color}`}>
                        {movement.movement_type === 'in' ? '+' : movement.movement_type === 'out' ? '-' : '='}{movement.quantity}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-400 font-medium">{movement.reason || '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustingProduct && (
        <AdjustStockModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onSuccess={() => setRefreshKey((current) => current + 1)}
        />
      )}
    </div>
  )
}
