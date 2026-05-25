'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, Plus, Search, Trash2, FileText, User, Edit2, AlertTriangle } from 'lucide-react'
import { useProfile } from '@/context/profile-context'
import AccountSuspendedBanner from './account-suspended-banner'
import { formatCurrency } from '@/lib/utils'
import { z } from 'zod'
import { Sparkles } from 'lucide-react'
import type { ProductRecord } from '@/lib/app-types'

type ProductOption = Pick<ProductRecord, 'id' | 'product_name' | 'suggested_price' | 'stock_quantity' | 'stock_alert_threshold'>

interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  available_stock: number
}

const saleSchema = z.object({
  customer_name: z.string().max(100).optional().nullable(),
  customer_phone: z.string().max(50).optional().nullable(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().min(0),
    total_price: z.number().min(0),
  })).min(1, 'Agrega al menos un producto'),
})

interface SalesLogFormProps {
  onSuccess: () => void
  mode?: 'sale' | 'quote'
}

export default function SalesLogForm({ onSuccess, mode = 'sale' }: SalesLogFormProps) {
  const { profile } = useProfile()
  const isSuspended = profile?.billing_status === 'disabled'
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [salePrice, setSalePrice] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderCount, setOrderCount] = useState<number | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (profile && profile.is_founder !== true) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      supabase
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .gte('created_at', startOfMonth.toISOString())
        .then(({ count }) => setOrderCount(count || 0))
    }
  }, [profile])

  useEffect(() => {
    let active = true

    async function fetchProducts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return

      const { data } = await supabase
        .from('products_roi')
        .select('id, product_name, suggested_price, stock_quantity, stock_alert_threshold')
        .eq('user_id', user.id)
        .order('product_name')

      if (!active) return
      setProducts((data as ProductOption[]) || [])
    }

    void fetchProducts()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProductSelect = (product: ProductOption) => {
    setSelectedProductId(product.id)
    setProductSearch(product.product_name)
    setSalePrice(product.suggested_price.toFixed(2))
    setShowProductDropdown(false)
    setError('')
  }

  const addItem = () => {
    if (!selectedProductId) {
      setError('Selecciona un producto.')
      return
    }

    const price = parseFloat(salePrice)
    const qty = Number.parseInt(quantity, 10)

    if (isNaN(price) || price <= 0) {
      setError('Precio invalido.')
      return
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      setError('La cantidad debe ser un numero entero mayor a 0.')
      return
    }

    const product = products.find((item) => item.id === selectedProductId)
    const stock = product?.stock_quantity ?? 0

    const newItem: SaleItem = {
      product_id: selectedProductId,
      product_name: product?.product_name || 'Producto',
      quantity: qty,
      unit_price: price,
      total_price: price * qty,
      available_stock: stock,
    }

    setItems((currentItems) => [...currentItems, newItem])
    setSelectedProductId('')
    setProductSearch('')
    setQuantity('1')
    setSalePrice('')
    setError('')
  }

  const removeItem = (index: number) => {
    setItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index))
  }

  const editItem = (index: number) => {
    const item = items[index]
    setSelectedProductId(item.product_id)
    setProductSearch(item.product_name)
    setSalePrice(item.unit_price.toString())
    setQuantity(item.quantity.toString())
    removeItem(index)
  }

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const hasStockWarning = mode === 'sale' && items.some((item) => item.quantity > item.available_stock)

  if (isSuspended) {
    return (
      <div className="space-y-6">
        <AccountSuspendedBanner />
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-300">
          La registración de ventas y presupuestos queda pausada hasta reactivar la cuenta.
        </div>
      </div>
    )
  }

  const isLimitReached = profile?.is_founder !== true && orderCount !== null && orderCount >= 10;

  if (isLimitReached) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-10 rounded-[2rem] border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800/40 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Límite mensual alcanzado</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-md mb-8 leading-relaxed">
            Has alcanzado el límite de 10 operaciones (presupuestos o ventas) de tu plan gratuito este mes.
            Adquiere la <span className="font-bold text-slate-900 dark:text-white">Licencia Fundador</span> para registrar ventas y presupuestos ilimitados para siempre.
          </p>
          <a
            href="https://wa.me/59899000000?text=Hola,%20quiero%20adquirir%20la%20Licencia%20Fundador%20de%20BizTracker%20por%20$49"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-700 hover:-translate-y-1"
          >
            <Sparkles size={18} />
            Desbloquear Licencia Fundador ($49)
          </a>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pago único. Sin suscripciones.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (submitStatus: 'finalized' | 'quote') => {
    setLoading(true)
    setError('')

    try {
      const validatedData = saleSchema.parse({
        customer_name: customerName.trim() || null,
        customer_phone: customerPhone.trim() || null,
        items,
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay una sesion activa')

      const finalStatus = mode === 'quote' ? 'quote' : submitStatus

      const { data: order, error: orderError } = await supabase
        .from('sales_orders')
        .insert({
          user_id: user.id,
          customer_name: validatedData.customer_name,
          customer_phone: validatedData.customer_phone,
          status: finalStatus,
          subtotal,
          total_amount: subtotal,
          currency_symbol: profile?.currency_symbol || '$',
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase.from('sales_order_items').insert(orderItems)
      if (itemsError) throw itemsError

      if (finalStatus === 'finalized') {
        for (const item of items) {
          const product = products.find((productOption) => productOption.id === item.product_id)
          const currentStock = product?.stock_quantity ?? 0
          const newStock = Math.max(0, currentStock - item.quantity)

          await supabase.from('products_roi').update({ stock_quantity: newStock }).eq('id', item.product_id)
          await supabase.from('stock_movements').insert({
            user_id: user.id,
            product_id: item.product_id,
            order_id: order.id,
            movement_type: 'out',
            quantity: item.quantity,
            reason: `Venta #${order.id.slice(0, 8)}`,
          })
        }
      }

      setItems([])
      setCustomerName('')
      setCustomerPhone('')
      setNotes('')
      onSuccess()
      alert(finalStatus === 'quote' ? 'Presupuesto guardado con exito' : 'Venta registrada con exito')
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        console.error(err)
        setError('Error al procesar la operacion. Verifica la base de datos.')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User size={12} /> Cliente (Opcional)
          </label>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User size={12} /> Telefono
          </label>
          <input
            type="text"
            placeholder="Ej: +54 9 11..."
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Plus size={16} className="text-indigo-600" />
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Agregar Producto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-2 relative" ref={dropdownRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={productSearch}
                onFocus={() => setShowProductDropdown(true)}
                onChange={(e) => {
                  setProductSearch(e.target.value)
                  setSelectedProductId('')
                  setShowProductDropdown(true)
                }}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 rounded-xl transition-all font-medium text-sm outline-none shadow-sm"
              />
            </div>
            {showProductDropdown && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 italic">No hay resultados.</p>
                ) : (
                  filteredProducts.map((product) => {
                    const stock = product.stock_quantity ?? 0
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {product.product_name}
                        <span className="block text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          P. Sugerido: {formatCurrency(product.suggested_price, profile?.currency_symbol || '$')}
                          <span className={`ml-2 font-black ${stock === 0 ? 'text-red-500' : stock <= (product.stock_alert_threshold ?? 5) ? 'text-amber-500' : 'text-emerald-600'}`}>
                            . Stock: {stock}
                          </span>
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{profile?.currency_symbol || '$'}</span>
              <input
                type="text"
                placeholder="Precio"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full pl-8 pr-3 py-3 bg-white dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 rounded-xl transition-all font-bold text-sm outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Cant. (Ej: 2)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ''))}
              className="w-full px-3 py-3 bg-white dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 rounded-xl transition-all font-bold text-sm outline-none shadow-sm text-center"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={addItem}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Anadir
            </button>
          </div>
        </div>
      </div>

      {hasStockWarning && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Algunos productos tienen cantidad mayor al stock disponible. La venta se registrara de todas formas, pero el stock quedara en 0.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Unit.</th>
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, index) => {
                  const insufficient = mode === 'sale' && item.quantity > item.available_stock
                  return (
                    <tr key={index} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${insufficient ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}`}>
                      <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                        {item.product_name}
                        {insufficient && (
                          <span className="ml-2 text-[9px] font-black text-amber-600 uppercase tracking-wider">stock insuf.</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-400">x {item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-500">{formatCurrency(item.unit_price, profile?.currency_symbol || '$')}</td>
                      <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(item.total_price, profile?.currency_symbol || '$')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => editItem(index)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Total acumulado</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                {formatCurrency(subtotal, profile?.currency_symbol || '$')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{items.length} productos</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          placeholder="Notas adicionales..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm outline-none min-h-[80px] resize-none"
        />

        {error && (
          <p className="text-xs text-red-500 font-bold px-2">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
          {mode === 'sale' ? (
            <>
              <button
                type="button"
                disabled={loading || items.length === 0}
                onClick={() => handleSubmit('quote')}
                className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
              >
                <FileText size={18} />
                Crear Presupuesto
              </button>
              <button
                type="button"
                disabled={loading || items.length === 0}
                onClick={() => handleSubmit('finalized')}
                className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {loading ? 'Procesando...' : 'Registrar Venta'}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={loading || items.length === 0}
              onClick={() => handleSubmit('quote')}
              className="col-span-2 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
            >
              <FileText size={18} />
              {loading ? 'Procesando...' : 'Guardar Cotizacion'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
