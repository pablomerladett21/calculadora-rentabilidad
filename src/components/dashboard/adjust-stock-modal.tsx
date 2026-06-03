'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { X, Loader2, PackagePlus, PackageMinus, SlidersHorizontal } from 'lucide-react'
import { z } from 'zod'
import type { ProductRecord } from '@/lib/app-types'

const adjustSchema = z.object({
  quantity: z.number().min(0, 'La cantidad no puede ser negativa').optional(),
  threshold: z.number().min(0, 'El umbral no puede ser negativo'),
})

interface AdjustStockModalProps {
  product: ProductRecord
  onClose: () => void
  onSuccess: () => void
}

type MovementType = 'in' | 'out' | 'adjustment'

export default function AdjustStockModal({ product, onClose, onSuccess }: AdjustStockModalProps) {
  const [movementType, setMovementType] = useState<MovementType>('in')
  const [quantity, setQuantity] = useState('')
  const [threshold, setThreshold] = useState(product.stock_alert_threshold?.toString() || '5')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const qty = parseFloat(quantity) || 0
  const newStock = movementType === 'in' 
    ? (product.stock_quantity || 0) + qty 
    : movementType === 'out'
    ? (product.stock_quantity || 0) - qty
    : qty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')

    try {
      // Zod Validation
      const validatedData = adjustSchema.parse({
        quantity: quantity ? parseFloat(quantity) : undefined,
        threshold: parseInt(threshold) || 0,
      })
      
      if (movementType === 'out' && (validatedData.quantity || 0) > (product.stock_quantity || 0)) {
        throw new Error('No hay suficiente stock disponible para esta salida.')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay una sesión activa')

      const finalStock = movementType === 'adjustment' ? (validatedData.quantity || 0) : newStock

      // Update products_roi with both stock and threshold
      const { error: updateError } = await supabase
        .from('products_roi')
        .update({ 
          stock_quantity: quantity ? finalStock : product.stock_quantity,
          stock_alert_threshold: validatedData.threshold 
        })
        .eq('id', product.id)

      if (updateError) throw updateError

      // Record movement only if quantity was changed
      if (quantity && (validatedData.quantity || 0) > 0) {
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            user_id: user.id,
            product_id: product.id,
            movement_type: movementType,
            quantity: validatedData.quantity,
            reason: reason.trim() || null,
          })

        if (movementError) throw movementError
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al ajustar el stock.')
      }
    } finally {
      setLoading(false)
    }
  }


  const TYPES = [
    { value: 'in', label: 'Entrada', icon: PackagePlus, color: 'bg-emerald-600', hint: 'Compra, producción, devolución' },
    { value: 'out', label: 'Salida', icon: PackageMinus, color: 'bg-red-500', hint: 'Pérdida, muestra, descarte' },
    { value: 'adjustment', label: 'Corrección', icon: SlidersHorizontal, color: 'bg-amber-500', hint: 'Ajustar al valor exacto' },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-8 pb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Ajustar Stock</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[220px]">{product.product_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Actual</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{product.stock_quantity ?? 0}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          {/* Movement Type */}
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map(({ value, label, icon: Icon, color, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMovementType(value)}
                className={`relative p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                  movementType === value
                    ? `${color} border-transparent text-white shadow-lg scale-105`
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                <span className={`text-[9px] font-medium leading-tight ${movementType === value ? 'text-white/70' : 'text-slate-400'}`}>{hint}</span>
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              {movementType === 'adjustment' ? 'Nuevo stock total' : 'Cantidad'}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="0"
              required
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none text-2xl font-black text-slate-900 dark:text-white text-center focus:ring-4 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Reason */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Motivo (Opcional)</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ej: Compra de materiales, pérdida..."
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-medium text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Configuración de Alerta</span>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Umbral de bajo stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preview */}

          {qty > 0 && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in zoom-in-95 duration-200 ${
              movementType === 'in' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30' 
              : movementType === 'out' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800/30'
              : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30'
            }`}>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Stock resultante</p>
              <p className={`text-3xl font-black ${
                movementType === 'in' ? 'text-emerald-600' : movementType === 'out' ? 'text-red-500' : 'text-amber-500'
              }`}>
                {movementType === 'adjustment' ? qty : newStock}
              </p>
            </div>
          )}

          {error && <p className="text-xs font-bold text-red-500 px-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (!quantity && !threshold)}
              className="flex-[2] py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              Confirmar
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
