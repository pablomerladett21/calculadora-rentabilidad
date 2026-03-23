import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, Plus, X, Search, ChevronDown } from 'lucide-react'
import { useProfile } from '@/context/profile-context'

interface SalesLogFormProps {
  onSuccess: () => void
}

export default function SalesLogForm({ onSuccess }: SalesLogFormProps) {
  const { profile } = useProfile()
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [salePrice, setSalePrice] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const qty = parseInt(quantity)
    const price = parseFloat(salePrice)

    if (!selectedProductId) { setError('Seleccioná un producto.'); return }
    if (isNaN(price) || price <= 0) { setError('Ingresá un precio válido.'); return }
    if (isNaN(qty) || qty < 1) { setError('La cantidad debe ser al menos 1.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const product = products.find(p => p.id === selectedProductId)
    const { error: insertError } = await supabase.from('sales').insert({
      user_id: user.id,
      product_id: selectedProductId,
      product_name: product?.product_name,
      sale_price: price,
      quantity: qty,
      notes: notes.trim() || null,
    })

    setLoading(false)
    if (insertError) {
      setError('Error al registrar la venta. Intentá de nuevo.')
    } else {
      setSelectedProductId('')
      setProductSearch('')
      setQuantity('1')
      setSalePrice('')
      setNotes('')
      onSuccess()
    }
  }

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Searchable Product Select */}
        <div className="md:col-span-2 space-y-2 relative" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscá un producto..."
              value={productSearch}
              onFocus={() => setShowProductDropdown(true)}
              onChange={(e) => {
                setProductSearch(e.target.value)
                setSelectedProductId('') // Reset selected if typing manually
                setShowProductDropdown(true)
              }}
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-900 dark:text-white outline-none border-none text-sm"
            />
            <ChevronDown 
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} 
              size={18} 
            />
          </div>
          
          {showProductDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in zoom-in-95 duration-200">
              {filteredProducts.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 italic">No se encontraron productos.</p>
              ) : (
                filteredProducts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProductSelect(p)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    {p.product_name}
                    <span className="block text-[10px] text-slate-400 font-medium">Sugerido: ${p.suggested_price}</span>
                  </button>
                ))
              )}
            </div>
          )}
          
          {products.length === 0 && !loading && (
            <p className="text-xs text-amber-500 font-medium pt-1">
              No tenés productos en el catálogo. Primero calculá el ROI de un producto.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio de Venta ({profile?.currency_symbol || '$'})</label>
          <input
            type="text"
            inputMode="decimal"
            value={salePrice}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9.]/g, '')
              setSalePrice(val)
            }}
            placeholder="0.00"
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 dark:text-white outline-none border-none text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cantidad</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const q = Math.max(1, (parseInt(quantity) || 1) - 1)
                setQuantity(q.toString())
              }}
              className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <X size={16} />
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '')
                setQuantity(val)
              }}
              className="flex-1 px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 dark:text-white outline-none border-none text-sm text-center"
            />
            <button
              type="button"
              onClick={() => {
                const q = (parseInt(quantity) || 0) + 1
                setQuantity(q.toString())
              }}
              className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ej: venta en feria, cliente frecuente..."
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 dark:text-white outline-none border-none text-sm"
          />
        </div>
      </div>

      {/* Total preview */}
      {selectedProductId && salePrice && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Total de esta venta</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            ${(parseFloat(salePrice || '0') * (parseInt(quantity) || 0)).toFixed(2)}
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-bold px-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={18} />
        {loading ? 'Registrando...' : 'Registrar Venta'}
      </button>
    </form>
  )
}
