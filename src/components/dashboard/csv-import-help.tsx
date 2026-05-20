'use client'

import { X, Download, ListChecks, FileText } from 'lucide-react'

type CsvImportHelpProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  templateHref: string
  steps: string[]
  columns: string[]
  example: string[]
}

export default function CsvImportHelp({
  isOpen,
  onClose,
  title,
  templateHref,
  steps,
  columns,
  example,
}: CsvImportHelpProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.25rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Ayuda de importacion</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Sigue estos pasos para subir tu archivo sin errores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-indigo-100 dark:border-indigo-800/40 bg-indigo-50/60 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Pasos</h3>
              </div>
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-300 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-slate-600 dark:text-slate-300" />
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Columnas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {columns.map((column) => (
                  <span
                    key={column}
                    className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    {column}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <a
                  href={templateHref}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                  <Download size={16} />
                  Descargar plantilla
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 overflow-x-auto">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Ejemplo de fila</h3>
            </div>
            <div className="min-w-max text-sm font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
              {example.join(',')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
