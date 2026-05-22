import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Calculator, Save, Loader2, Info, Sparkles, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useProfile } from '@/context/profile-context'
import AccountSuspendedBanner from './account-suspended-banner'
import { z } from 'zod'

const productSchema = z.object({
  product_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  material_cost: z.number().min(0, 'El costo no puede ser negativo'),
  time_invested_hours: z.number().min(0, 'El tiempo no puede ser negativo'),
  hourly_rate: z.number().min(0, 'La tarifa no puede ser negativa'),
  desired_margin_percent: z.number().min(0).max(99, 'El margen debe ser menor al 100%'),
  stock_quantity: z.number().min(0, 'El stock no puede ser negativo'),
  stock_alert_threshold: z.number().min(0, 'El umbral no puede ser negativo'),
})

interface RoiFormProps {
  onSuccess: () => void
}

export default function RoiForm({ onSuccess }: RoiFormProps) {
  const { profile } = useProfile()
  const isSuspended = profile?.billing_status === 'disabled'
  const [productName, setProductName] = useState('')
  const [materialCost, setMaterialCost] = useState('')
  const [timeInvested, setTimeInvested] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [desiredMargin, setDesiredMargin] = useState('30')
  const [stockQuantity, setStockQuantity] = useState('')
  const [stockAlertThreshold, setStockAlertThreshold] = useState('5')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const material = parseFloat(materialCost) || 0
  const time = parseFloat(timeInvested) || 0
  const rate = parseFloat(hourlyRate) || 0
  const margin = parseFloat(desiredMargin) || 0

  const totalCost = material + (time * rate)
  const suggestedPrice = margin < 100 ? totalCost / (1 - (margin / 100)) : 0
  const profit = suggestedPrice - totalCost

  if (isSuspended) {
    return (
      <div className="space-y-6">
        <AccountSuspendedBanner />
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-300">
          Si necesitás reactivar la cuenta, pedile a admin que cambie el estado a <span className="font-black">Prueba</span> o <span className="font-black">Pago</span>.
        </div>
      </div>
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation with Zod
      const validatedData = productSchema.parse({
        product_name: productName.trim(),
        material_cost: parseFloat(materialCost) || 0,
        time_invested_hours: parseFloat(timeInvested) || 0,
        hourly_rate: parseFloat(hourlyRate) || 0,
        desired_margin_percent: parseFloat(desiredMargin) || 0,
        stock_quantity: parseFloat(stockQuantity) || 0,
        stock_alert_threshold: parseInt(stockAlertThreshold) || 5,
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay una sesión activa')

      const { data: product, error: insertError } = await supabase
        .from('products_roi')
        .insert([{
          user_id: user.id,
          ...validatedData,
          suggested_price: suggestedPrice,
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Si se cargó stock inicial, registrar el movimiento
      if (validatedData.stock_quantity > 0) {
        await supabase.from('stock_movements').insert({
          user_id: user.id,
          product_id: product.id,
          movement_type: 'in',
          quantity: validatedData.stock_quantity,
          reason: 'Stock inicial',
        })
      }

      setProductName('')
      setMaterialCost('')
      setTimeInvested('')
      setHourlyRate('')
      setStockQuantity('')
      setStockAlertThreshold('5')
      onSuccess()
      setSaved(true)
      setTimeout(() => setSaved(false), 5000)
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al guardar el producto')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Calculator size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Configura tus costos</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Nombre del Producto</label>
            <input
              type="text"
              placeholder="Ej: Torta de Chocolate Artesanal"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-medium text-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Costo Materiales</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{profile?.currency_symbol || '$'}</span>
                <input
                  type="number"
                  step="0.01"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(e.target.value)}
                  className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-black text-slate-950 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Margen Deseado (%)</label>
              <input
                type="number"
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-black text-slate-950 dark:text-white text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Horas de trabajo</label>
              <input
                type="number"
                step="0.1"
                value={timeInvested}
                onChange={(e) => setTimeInvested(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-black text-slate-950 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Valor Hora</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{profile?.currency_symbol || '$'}</span>
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none dark:bg-slate-800/50 dark:border-slate-700 transition-all font-black text-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Stock Inicial */}
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 space-y-4">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-indigo-600" />
              <p className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Stock Inicial (Opcional)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidades disponibles</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-slate-900 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alerta bajo stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="5"
                  value={stockAlertThreshold}
                  onChange={(e) => setStockAlertThreshold(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/50 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {saved && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                  <Save size={16} />
                </div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">¡Producto guardado en el catálogo!</p>
              </div>
              <Link href="/dashboard/catalog" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">Ver Catálogo</Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !productName}
            className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Guardar en Catálogo
          </button>
        </form>
      </div>

      <div className="space-y-8">
        <div className="p-10 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <h3 className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em]">Precio Sugerido</h3>
            <p className="text-7xl font-black mt-4 tracking-tighter">{formatCurrency(suggestedPrice)}</p>
            <div className="mt-12 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10 group/row">
                <span className="text-indigo-100 text-sm font-bold uppercase tracking-widest group-hover/row:text-white transition-colors">Costo Directo</span>
                <span className="text-2xl font-black">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10 group/row">
                <span className="text-indigo-100 text-sm font-bold uppercase tracking-widest group-hover/row:text-white transition-colors">Ganancia Neta</span>
                <span className="text-2xl font-black text-emerald-300">{formatCurrency(profit)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 group/row">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-200 animate-pulse" />
                  <span className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Retorno</span>
                </div>
                <span className="text-2xl font-black bg-white/10 px-4 py-1 rounded-xl">
                  {totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 dark:bg-slate-900/40 dark:border-amber-900/20 flex gap-6 group hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform">
            <Info size={24} />
          </div>
          <div className="space-y-2">
            <p className="font-black text-amber-900 dark:text-amber-100 uppercase text-xs tracking-widest">¿Cómo funciona?</p>
            <p className="text-sm text-amber-800/80 leading-relaxed dark:text-amber-300/80 font-medium">
              El precio sugerido se calcula para asegurar el margen deseado sobre el costo total (Materiales + Mano de Obra). 
              <span className="block mt-2 font-black italic">Fórmula: Costo Total / (1 - Margen %)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
