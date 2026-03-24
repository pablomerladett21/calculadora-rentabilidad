'use client'

import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Verificando sesión...</p>
      </div>
    </div>
  )
}
