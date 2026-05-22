'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileDown, Eye, X, Upload } from 'lucide-react'
import type { AdminClientRecord } from '@/lib/app-types'
import type { BillingStatus } from '@/lib/admin'
import { cn } from '@/lib/utils'

type ImportKind = 'products' | 'subscriptions'

export default function AdminClientsTable({ clients }: { clients: AdminClientRecord[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<AdminClientRecord | null>(null)
  const [importClient, setImportClient] = useState<AdminClientRecord | null>(null)
  const [importKind, setImportKind] = useState<ImportKind>('products')
  const [savingId, setSavingId] = useState<string | null>(null)

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return clients

    return clients.filter((client) =>
      client.email.toLowerCase().includes(term) ||
      (client.business_name || '').toLowerCase().includes(term)
    )
  }, [clients, search])

  const updateBillingStatus = async (clientId: string, billingStatus: BillingStatus) => {
    setSavingId(clientId)

    try {
      const response = await fetch('/api/admin/client-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId, billingStatus }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'No se pudo actualizar el estado')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo actualizar el estado')
    } finally {
      setSavingId(null)
    }
  }

  const handleImport = async (file: File) => {
    if (!importClient) return

    const formData = new FormData()
    formData.set('clientId', importClient.id)
    formData.set('importKind', importKind)
    formData.set('file', file)

    const response = await fetch('/api/admin/import', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.error || 'No se pudo importar el CSV')
    }

    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Clientes</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lista de usuarios y negocios</h2>
          </div>

          <div className="relative w-full lg:max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por email o negocio..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
              <tr>
                <th className="text-left px-6 py-4">Cliente</th>
                <th className="text-left px-6 py-4">Email</th>
                <th className="text-left px-6 py-4">Estado</th>
                <th className="text-center px-6 py-4">Productos</th>
                <th className="text-center px-6 py-4">Ventas</th>
                <th className="text-right px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 dark:text-white">{client.business_name || 'Sin nombre'}</div>
                    <div className="text-xs text-slate-400 font-medium">ID: {client.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{client.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={client.billing_status}
                      disabled={savingId === client.id}
                      onChange={(event) => {
                        const nextStatus = event.target.value as BillingStatus
                        void updateBillingStatus(client.id, nextStatus)
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-widest outline-none transition-colors',
                        client.billing_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : client.billing_status === 'disabled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      <option value="trial">Prueba</option>
                      <option value="paid">Pago</option>
                      <option value="disabled">Suspendido</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-12 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-black text-sm">
                      {client.product_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-12 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-black text-sm">
                      {client.sales_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setImportClient(null)
                          setSelectedClient(client)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        <Eye size={14} />
                        Ver detalle
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(null)
                          setImportKind('products')
                          setImportClient(client)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                      >
                        <FileDown size={14} />
                        Importar CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    No se encontraron clientes con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}

      {importClient && (
        <ImportModal
          client={importClient}
          importKind={importKind}
          setImportKind={setImportKind}
          onClose={() => setImportClient(null)}
          onImport={handleImport}
        />
      )}
    </div>
  )
}

function ClientDetailModal({
  client,
  onClose,
}: {
  client: AdminClientRecord
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Detalle</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{client.business_name || 'Sin nombre'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{client.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard label="Estado" value={client.billing_status} />
          <InfoCard label="Productos" value={client.product_count} />
          <InfoCard label="Ventas" value={client.sales_count} />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function ImportModal({
  client,
  importKind,
  setImportKind,
  onClose,
  onImport,
}: {
  client: AdminClientRecord
  importKind: ImportKind
  setImportKind: (value: ImportKind) => void
  onClose: () => void
  onImport: (file: File) => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Importar CSV</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cargar datos a {client.business_name || 'este cliente'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{client.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setImportKind('products')}
              className={cn(
                'px-4 py-3 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all',
                importKind === 'products'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              Productos
            </button>
            <button
              type="button"
              onClick={() => setImportKind('subscriptions')}
              className={cn(
                'px-4 py-3 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all',
                importKind === 'subscriptions'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              Gastos fijos
            </button>
          </div>

          <label className="block rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <Upload className="mx-auto text-indigo-600 dark:text-indigo-400" size={22} />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              {file ? file.name : 'Selecciona un CSV para importar'}
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] || null
                setFile(selected)
              }}
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black text-slate-600 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!file || loading}
              onClick={async () => {
                if (!file) return
                setLoading(true)
                try {
                  await onImport(file)
                  onClose()
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'No se pudo importar el archivo')
                } finally {
                  setLoading(false)
                }
              }}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
