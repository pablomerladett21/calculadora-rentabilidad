import type { ComponentType } from 'react'
import Link from 'next/link'
import { BarChart3, ArrowLeft, Package, ShieldAlert, ShoppingCart, Users } from 'lucide-react'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import type { AdminClientRecord } from '@/lib/app-types'
import AdminClientsTable from '@/components/admin/admin-clients-table'

export const dynamic = 'force-dynamic'

type AuthUser = {
  id: string
  email: string | undefined
  created_at?: string
}

type ProfileRow = {
  id: string
  email: string | null
  business_name: string | null
  billing_status: 'trial' | 'paid' | 'disabled' | null
}

async function fetchAllAuthUsers() {
  const supabase = createAdminSupabaseClient()
  const users: AuthUser[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw error
    }

    users.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email || undefined,
        created_at: user.created_at,
      }))
    )

    if (!data.lastPage || page >= data.lastPage) break
    page += 1
  }

  return users
}

async function loadAdminData() {
  const supabase = createAdminSupabaseClient()

  const [users, profilesRes, productsRes, salesRes] = await Promise.all([
    fetchAllAuthUsers(),
    supabase.from('profiles').select('id,email,business_name,billing_status'),
    supabase.from('products_roi').select('user_id'),
    supabase.from('sales_orders').select('user_id').eq('status', 'finalized'),
  ])

  if (profilesRes.error) throw profilesRes.error
  if (productsRes.error) throw productsRes.error
  if (salesRes.error) throw salesRes.error

  const profiles = (profilesRes.data || []) as ProfileRow[]

  const productCounts: Record<string, number> = {}
  const salesCounts: Record<string, number> = {}

  ;(productsRes.data || []).forEach((row) => {
    productCounts[row.user_id] = (productCounts[row.user_id] || 0) + 1
  })

  ;(salesRes.data || []).forEach((row) => {
    salesCounts[row.user_id] = (salesCounts[row.user_id] || 0) + 1
  })

  const profileMap = new Map<string, ProfileRow>()
  profiles.forEach((profile) => {
    profileMap.set(profile.id, profile)
  })

  const clients: AdminClientRecord[] = users.map((user) => {
    const profile = profileMap.get(user.id)
    const email = profile?.email || user.email || ''
    const businessName = profile?.business_name || email.split('@')[0] || null
    const billingStatus = profile?.billing_status || 'trial'

    return {
      id: user.id,
      email,
      business_name: businessName,
      billing_status: billingStatus,
      product_count: productCounts[user.id] || 0,
      sales_count: salesCounts[user.id] || 0,
      created_at: user.created_at || null,
    }
  })

  const stats = {
    totalClients: clients.length,
    trialClients: clients.filter((client) => client.billing_status === 'trial').length,
    paidClients: clients.filter((client) => client.billing_status === 'paid').length,
    disabledClients: clients.filter((client) => client.billing_status === 'disabled').length,
    totalProducts: Object.values(productCounts).reduce((acc, value) => acc + value, 0),
    totalSales: Object.values(salesCounts).reduce((acc, value) => acc + value, 0),
  }

  return { clients, stats }
}

function SetupNotice({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full rounded-[2rem] border border-rose-500/30 bg-rose-500/10 p-8 shadow-2xl shadow-rose-500/10">
        <div className="flex items-center gap-3 text-rose-300 mb-4">
          <ShieldAlert size={20} />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Admin no disponible</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">Revisa la configuración del panel admin</h1>
        <p className="mt-3 text-sm text-rose-100/80 leading-relaxed">
          {message}
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard" className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm">
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const data = await loadAdminData().catch((error: unknown) => ({
    error: error instanceof Error ? error.message : 'No se pudo cargar el panel admin.',
  }))

  if ('error' in data) {
    return <SetupNotice message={data.error} />
  }

  const { clients, stats } = data

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
              <ShieldAlert size={16} />
              <span>Panel Admin</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Clientes y estado comercial</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Busca por email o negocio, revisa estado de prueba/pago e importa CSV directo a la cuenta de cada cliente.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Volver al dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Clientes" value={stats.totalClients} icon={Users} />
          <StatCard title="Prueba" value={stats.trialClients} icon={ShieldAlert} />
          <StatCard title="Pagos" value={stats.paidClients} icon={BarChart3} />
          <StatCard title="Productos" value={stats.totalProducts} icon={Package} />
          <StatCard title="Ventas" value={stats.totalSales} icon={ShoppingCart} />
        </div>

        <AdminClientsTable clients={clients} />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number
  icon: ComponentType<{ size?: number }>
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}
