'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { X, Save, Loader2, Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useProfile } from '@/context/profile-context'

interface EditProductModalProps {
  product: any
  onSuccess: () => void
  onClose: () => void
}

export default function EditProductModal({ product, onSuccess, onClose }: EditProductModalProps) {
  const { profile } = useProfile()
  const [productName, setProductName] = useState(product.product_name)
  const [materialCost, setMaterialCost] = useState(product.material_cost.toString())
  const [timeInvested, setTimeInvested] = useState(product.time_invested_hours.toString())
  const [hourlyRate, setHourlyRate] = useState(product.hourly_rate.toString())
  const [desiredMargin, setDesiredMargin] = useState(product.desired_margin_percent.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const material = parseFloat(materialCost) || 0
  const time = parseFloat(timeInvested) || 0
  const rate = parseFloat(hourlyRate) || 0
  const margin = parseFloat(desiredMargin) || 0

  const totalCost = material + (time * rate)
  const suggestedPrice = margin < 100 ? totalCost / (1 - (margin / 100)) : 0

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('products_roi')
        .update({
          product_name: productName,
          material_cost: parseFloat(materialCost),
          time_invested_hours: parseFloat(timeInvested),
          hourly_rate: parseFloat(hourlyRate),
          desired_margin_percent: parseInt(desiredMargin),
          suggested_price: suggestedPrice,
        })
        .eq('id', product.id)

      if (error) throw error
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error updating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Editar Producto</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Calculando márgenes en tiempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Producto</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Costo Materiales</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{profile?.currency_symbol || '$'}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    className="w-full pl-10 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Margen (%)</label>
                <input
                  type="number"
                  value={desiredMargin}
                  onChange={(e) => setDesiredMargin(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Horas</label>
                <input
                  type="number"
                  step="0.1"
                  value={timeInvested}
                  onChange={(e) => setTimeInvested(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Valor Hora</label>
                <div className="relative group">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{profile?.currency_symbol || '$'}</span>
                   <input
                     type="number"
                     step="0.01"
                     value={hourlyRate}
                     onChange={(e) => setHourlyRate(e.target.value)}
                     className="w-full pl-10 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black"
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-between border border-indigo-100 dark:border-indigo-800/50 mt-4">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Nuevo Precio Sugerido</p>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(suggestedPrice, profile?.currency_symbol || '$')}</p>
             </div>
             <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest shadow-sm">
                ROI: {totalCost > 0 ? (((suggestedPrice - totalCost) / totalCost) * 100).toFixed(1) : '0'}%
             </div>
          </div>

          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
