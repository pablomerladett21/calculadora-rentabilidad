'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  CreditCard, 
  Package, 
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useProfile } from '@/context/profile-context'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

export default function DashboardPage() {
  const { profile } = useProfile()
  const [stats, setStats] = useState({
    subscriptionTotal: 0,
    productCount: 0,
    avgMargin: 0,
    todaySales: 0,
    subsByCategory: [] as any[],
    topProducts: [] as any[],
    recentActivity: [] as any[],
    salesTrend: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      
      const { data: subs } = await supabase.from('subscriptions').select('*')
      const { data: products } = await supabase.from('products_roi').select('*')

      // Sales: last 7 days trend
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      const { data: salesRaw } = await supabase
        .from('sales')
        .select('total, sold_at')
        .gte('sold_at', sevenDaysAgo.toISOString())

      // Build last 7 days array
      const salesMap: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit' })
        salesMap[key] = 0
      }
      ;(salesRaw || []).forEach(s => {
        const d = new Date(s.sold_at)
        const key = d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit' })
        if (salesMap[key] !== undefined) salesMap[key] += parseFloat(s.total)
      })
      const salesTrend = Object.entries(salesMap).map(([day, total]) => ({ day, total }))

      // Today's sales total
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todaySales = (salesRaw || [])
        .filter(s => new Date(s.sold_at) >= todayStart)
        .reduce((a, s) => a + parseFloat(s.total), 0)

      const subTotal = (subs || []).reduce((acc, sub) => {
        const cost = parseFloat(sub.cost)
        return acc + (sub.billing_cycle === 'yearly' ? cost / 12 : cost)
      }, 0)

      const categoryMap: Record<string, number> = {}
      subs?.forEach(sub => {
        const cat = sub.category || 'Otros'
        const cost = parseFloat(sub.cost)
        const monthlyCost = sub.billing_cycle === 'yearly' ? cost / 12 : cost
        categoryMap[cat] = (categoryMap[cat] || 0) + monthlyCost
      })
      const subsByCategory = Object.entries(categoryMap).map(([title, value]) => ({ title, value }))

      const count = products?.length || 0
      const margin = count > 0 
        ? products!.reduce((acc, p) => acc + p.desired_margin_percent, 0) / count 
        : 0

      const topProducts = (products || [])
        .sort((a, b) => b.desired_margin_percent - a.desired_margin_percent)
        .slice(0, 5)
        .map(p => ({
          name: p.product_name,
          cost: p.material_cost + (p.time_invested_hours * p.hourly_rate),
          price: p.suggested_price
        }))

      const recentSubs = (subs || []).slice(0, 3).map(s => ({ 
        ...s, type: 'subscription', name: s.name,
        date: s.created_at || new Date().toISOString() 
      }))
      const recentProds = (products || []).slice(0, 3).map(p => ({ 
        ...p, type: 'product', name: p.product_name,
        date: p.created_at || new Date().toISOString() 
      }))
      const recentActivity = [...recentSubs, ...recentProds]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      setStats({
        subscriptionTotal: subTotal,
        productCount: count,
        avgMargin: margin,
        todaySales,
        subsByCategory,
        topProducts,
        recentActivity,
        salesTrend,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
            <Sparkles size={16} />
            <span>Panel de Control</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Bienvenido de nuevo</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Aquí tienes un resumen de tu negocio hoy.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/dashboard/sales"
            className="group flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 text-sm"
          >
            <ShoppingCart size={18} />
            Registrar Venta
          </Link>
          <Link 
            href="/dashboard/roi-calc"
            className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 active:scale-95 text-sm"
          >
            <Plus size={18} />
            Nuevo Análisis
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Gastos Mensuales" 
          value={loading ? '...' : formatCurrency(stats.subscriptionTotal, profile?.currency_symbol || '$')} 
          subtitle="Proyectado en suscripciones"
          icon={CreditCard} trend="+2.4%"
          color="bg-blue-600"
          lightColor="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <Link href="/dashboard/catalog" className="block transition-transform hover:-translate-y-1">
          <StatCard 
            title="Catálogo de Productos" 
            value={loading ? '...' : stats.productCount.toString()} 
            subtitle="Análisis de rentabilidad"
            icon={Package} trend={stats.productCount > 0 ? "Activo" : "Vacío"}
            color="bg-indigo-600"
            lightColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
          />
        </Link>
        <StatCard 
          title="Margen de Beneficio" 
          value={loading ? '...' : `${stats.avgMargin.toFixed(1)}%`} 
          subtitle="Promedio por producto"
          icon={TrendingUp} trend="Saludable"
          color="bg-emerald-600"
          lightColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
        />
        <Link href="/dashboard/sales" className="block transition-transform hover:-translate-y-1">
          <StatCard 
            title="Ventas de Hoy" 
            value={loading ? '...' : formatCurrency(stats.todaySales, profile?.currency_symbol || '$')} 
            subtitle="Click para registrar"
            icon={ShoppingCart} trend="Ver todo"
            color="bg-amber-500"
            lightColor="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
          />
        </Link>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Distribución de Gastos</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Suscripciones</div>
          </div>
          <div className="h-[280px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center animate-pulse text-slate-400 font-bold text-xs uppercase tracking-widest">Calculando...</div>
            ) : stats.subsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.subsByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5} dataKey="value" nameKey="title">
                    {stats.subsByCategory.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm font-medium">Sin datos disponibles</p>
                <Link href="/dashboard/subscriptions" className="mt-2 text-indigo-600 font-bold hover:underline">Agregar suscripción</Link>
              </div>
            )}
          </div>
        </div>

        {/* Sales Trend LineChart */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ventas — Últimos 7 Días</h3>
            <Link href="/dashboard/sales" className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
              Ver Ventas
            </Link>
          </div>
          <div className="h-[280px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center animate-pulse text-slate-400 font-bold text-xs uppercase tracking-widest">Analizando...</div>
            ) : stats.salesTrend.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesTrend} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: any) => [formatCurrency(v, profile?.currency_symbol || '$'), 'Ventas']}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fill="url(#salesGradient)" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCart size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Sin ventas en los últimos 7 días</p>
                <Link href="/dashboard/sales" className="mt-2 text-emerald-600 font-bold hover:underline">Registrar primera venta</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Top Profitability */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Rentabilidad</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">ROI %</div>
          </div>
          <div className="h-[280px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center animate-pulse text-slate-400 font-bold text-xs uppercase tracking-widest">Analizando...</div>
            ) : stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="cost" name="Costo" stackId="a" fill="#e2e8f0" />
                  <Bar dataKey="price" name="Sugerido" stackId="b" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm font-medium">No hay productos analizados</p>
                <Link href="/dashboard/roi-calc" className="mt-2 text-indigo-600 font-bold hover:underline">Calcular ROI</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Actividad Reciente</h3>
            <Link href="/dashboard/catalog" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Ver todo</Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />)
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.type === 'subscription' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {activity.type === 'subscription' ? <CreditCard size={14} /> : <Package size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{activity.type === 'subscription' ? 'Suscripción' : 'Producto'}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-300">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-400 text-xs font-medium italic">Sin actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* Insight Panel */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl group border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp size={120} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-black mb-4 uppercase tracking-tight">Insight de hoy</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Margen promedio del <span className="text-white font-bold">{stats.avgMargin.toFixed(1)}%</span>. Tu negocio opera con un rendimiento saludable.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-xs font-bold text-slate-300">Margen saludable</p>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <p className="text-xs font-bold">Costos controlados</p>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Link href="/dashboard/sales" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs rounded-2xl transition-all">
              <ShoppingCart size={16} />
              Ir a Ventas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color, lightColor }: any) {
  return (
    <div className="group p-8 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className={`p-4 rounded-2xl ${lightColor} transition-colors group-hover:scale-110 duration-300`}>
            <Icon size={28} />
          </div>
          <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-tighter shadow-sm">
            {trend}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 dark:border-slate-800/50 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
