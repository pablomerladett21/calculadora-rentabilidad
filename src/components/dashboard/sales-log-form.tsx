import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, Plus, X, Search, ChevronDown, Trash2, FileText, User, Edit2 } from 'lucide-react'
import { useProfile } from '@/context/profile-context'
import { formatCurrency } from '@/lib/utils'

interface SalesLogFormProps {
  onSuccess: () => void
}

export default function SalesLogForm({ onSuccess }: SalesLogFormProps) {
  const { profile } = useProfile()
  const [products, setProducts] = useState<any[]>([])
  
  // Current Item State (Draft)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [salePrice, setSalePrice] = useState('')
  
  // Cart State
  const [items, setItems] = useState<any[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchProducts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('products_roi')
        .select('id, product_name, suggested_price')
        .eq('user_id', user.id)
        .order('product_name')
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProductSelect = (product: any) => {
    setSelectedProductId(product.id)
    setProductSearch(product.product_name)
    setSalePrice(product.suggested_price.toFixed(2))
    setShowProductDropdown(false)
    setError('')
  }

  const addItem = () => {
    if (!selectedProductId) { setError('Seleccioná un producto.'); return }
    const price = parseFloat(salePrice)
    const qty = parseInt(quantity)
    if (isNaN(price) || price <= 0) { setError('Precio inválido.'); return }
    if (isNaN(qty) || qty < 1) { setError('Cantidad inválida.'); return }

    const product = products.find(p => p.id === selectedProductId)
    const newItem = {
      product_id: selectedProductId,
      product_name: product?.product_name,
      quantity: qty,
      unit_price: price,
      total_price: price * qty
    }

    setItems([...items, newItem])
    // Reset draft
    setSelectedProductId('')
    setProductSearch('')
    setQuantity('1')
    setSalePrice('')
    setError('')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
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

  const handleSubmit = async (status: 'finalized' | 'quote') => {
    if (items.length === 0) { setError('Agregá al menos un producto.'); return }
    
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user session')

      // 1. Create Order Header
      const { data: order, error: orderError } = await supabase
        .from('sales_orders')
        .insert({
          user_id: user.id,
          customer_name: customerName.trim() || null,
          customer_phone: customerPhone.trim() || null,
          status: status,
          subtotal: subtotal,
          total_amount: subtotal,
          currency_symbol: profile?.currency_symbol || '$',
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase
        .from('sales_order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Success
      setItems([])
      setCustomerName('')
      setCustomerPhone('')
      setNotes('')
      onSuccess()
      alert(status === 'quote' ? 'Presupuesto guardado con éxito' : 'Venta registrada con éxito')
    } catch (err: any) {
      console.error(err)
      setError('Error al procesar la operación. Verificá la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User size={12} /> Cliente (Opcional)
          </label>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User size={12} /> Teléfono
          </label>
          <input
            type="text"
            placeholder="Ej: +54 9 11..."
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm outline-none"
          />
        </div>
      </div>

      {/* 2. Item Entry (Draft) */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 mb-2">
           <Plus size={16} className="text-indigo-600" />
           <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Agregar Producto</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Product Select */}
          <div className="md:col-span-5 space-y-2 relative" ref={dropdownRef}>
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
                  filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProductSelect(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {p.product_name}
                      <span className="block text-[10px] text-slate-400">P. Sugerido: {formatCurrency(p.suggested_price, profile?.currency_symbol || '$')}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="md:col-span-3 space-y-2">
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{profile?.currency_symbol || '$'}</span>
               <input
                 type="text"
                 placeholder="Precio"
                 value={salePrice}
                 onChange={e => setSalePrice(e.target.value.replace(/[^0-9.]/g, ''))}
                 className="w-full pl-8 pr-3 py-3 bg-white dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 rounded-xl transition-all font-bold text-sm outline-none shadow-sm"
               />
            </div>
          </div>

          {/* Quantity */}
          <div className="md:col-span-2 space-y-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-3 bg-white dark:bg-slate-900 border border-transparent focus:border-indigo-500/30 rounded-xl transition-all font-bold text-sm outline-none shadow-sm text-center"
            />
          </div>

          {/* Add Button */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={addItem}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Añadir
            </button>
          </div>
        </div>
      </div>

      {/* 3. Items List / Cart */}
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
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{item.product_name}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-400">x{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-500">{formatCurrency(item.unit_price, profile?.currency_symbol || '$')}</td>
                    <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(item.total_price, profile?.currency_symbol || '$')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          type="button" 
                          onClick={() => editItem(index)}
                          className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
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

      {/* 4. Notes and Actions */}
      <div className="space-y-4">
        <textarea
          placeholder="Notas adicionales..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm outline-none min-h-[80px] resize-none"
        />

        {error && (
          <p className="text-xs text-red-500 font-bold px-2">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
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
        </div>
      </div>
    </div>
  )
}
