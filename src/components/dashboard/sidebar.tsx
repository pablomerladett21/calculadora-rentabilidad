'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CreditCard, 
  Calculator, 
  Settings,
  X,
  Zap,
  Archive,
  ShoppingCart,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Suscripciones', href: '/dashboard/subscriptions', icon: CreditCard },
  { name: 'Calculadora ROI', href: '/dashboard/roi-calc', icon: Calculator },
  { name: 'Catálogo de Productos', href: '/dashboard/catalog', icon: Archive },
  { name: 'Registro de Ventas', href: '/dashboard/sales', icon: ShoppingCart },
  { name: 'Presupuestos', href: '/dashboard/quotes', icon: FileText },
]

interface SidebarProps {
  onClear?: () => void
}

export default function Sidebar({ onClear }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-68 flex-shrink-0 bg-white border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm z-40">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-20 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 dark:text-white group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Zap size={22} fill="currentColor" />
            </div>
            <span>BizTracker</span>
          </Link>
          {onClear && (
            <button onClick={onClear} className="lg:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="px-4 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-3 mb-4">Menú Principal</p>
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 relative group",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/20 dark:text-indigo-300" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/50"
                  )}
                >
                  <item.icon 
                    size={20} 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} 
                  />
                  {item.name}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 rounded-xl hover:text-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <Settings size={20} className="text-slate-400" />
            Configuración
          </Link>
        </div>
      </div>
    </aside>
  )
}
