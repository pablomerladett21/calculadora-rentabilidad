'use client'

import { formatCurrency } from '@/lib/utils'
import { FileText, Printer, X, MessageCircle, Copy } from 'lucide-react'
import type { BusinessProfileRecord, SalesOrderItemRecord, SalesOrderRecord } from '@/lib/app-types'

interface QuoteViewProps {
  quote: SalesOrderRecord
  businessProfile: BusinessProfileRecord | null
  onClose: () => void
}

export default function QuoteView({ quote, businessProfile, onClose }: QuoteViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const buildQuoteMessage = () => {
    const businessName = businessProfile?.business_name || 'Mi Negocio'
    const clientName = quote.customer_name || 'Consumidor Final'
    const currency = quote.currency_symbol || businessProfile?.currency_symbol || '$'
    const lines = quote.items
      .map((item) => `- ${item.quantity} x ${item.product_name} (${formatCurrency(item.total_price, currency)})`)
      .join('\n')

    return [
      `${businessName} - ${quote.status === 'quote' ? 'Presupuesto' : 'Comprobante'}`,
      `Cliente: ${clientName}`,
      `Fecha: ${new Date(quote.created_at).toLocaleDateString()}`,
      '',
      lines,
      '',
      `Total: ${formatCurrency(quote.total_amount, currency)}`,
      quote.notes ? `Notas: ${quote.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const handleWhatsAppShare = () => {
    const message = buildQuoteMessage()
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    const message = buildQuoteMessage()
    await navigator.clipboard.writeText(message)
    alert('Resumen copiado al portapapeles.')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 print:bg-white print:p-0 print:block">
      <style jsx global>{`
        @media print {
          html, body {
            height: 100vh;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            min-height: 100vh;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .print-hidden {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
        }
      `}</style>
      <div
        id="print-area"
        className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col relative print:shadow-none print:max-h-none print:w-full print:rounded-none"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between print:hidden print-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {quote.status === 'quote' ? `Presupuesto #${quote.id.slice(0, 8)}` : `Comprobante #${quote.id.slice(0, 8)}`}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Vista Previa Profesional</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button
              onClick={handleCopy}
              className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <Copy size={16} /> Copiar
            </button>
            <button
              onClick={handlePrint}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <Printer size={16} /> PDF
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div id="printable-quote" className="flex-1 overflow-y-auto p-12 bg-white text-slate-900 print:p-8">
          <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
            <div className="space-y-4">
              {businessProfile?.logo_url ? (
                <img src={businessProfile.logo_url} alt="Logo" className="h-16 w-auto object-contain" />
              ) : (
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-2xl uppercase shadow-sm">
                  {businessProfile?.business_name?.[0] || 'B'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-indigo-600">{businessProfile?.business_name || 'Mi Negocio'}</h1>
                <p className="text-sm text-slate-500 font-medium">{businessProfile?.business_address || 'Direccion no especificada'}</p>
                <p className="text-sm text-slate-500 font-medium">
                  WhatsApp / Tel: {businessProfile?.whatsapp_phone || businessProfile?.business_phone || 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right space-y-2 pt-2">
              <div className={`inline-block px-4 py-1.5 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] ${quote.status === 'quote' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {quote.status === 'quote' ? 'Presupuesto' : 'Comprobante de Venta'}
              </div>
              <p className="text-sm font-black text-slate-900">ID: {quote.id.slice(0, 12)}</p>
              <p className="text-sm text-slate-500 font-bold">Fecha: {new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <hr className="border-slate-100 mb-12" />

          <div className="mb-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Para el Cliente:</p>
            <h4 className="text-lg font-black text-slate-900">{quote.customer_name || 'Consumidor Final'}</h4>
            {quote.customer_phone && <p className="text-sm text-slate-500 font-medium">{quote.customer_phone}</p>}
          </div>

          <div className="mb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-xs font-black uppercase tracking-widest">Descripcion</th>
                  <th className="py-4 text-xs font-black uppercase tracking-widest text-center">Cant.</th>
                  <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Precio Unit.</th>
                  <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.items?.map((item: SalesOrderItemRecord, idx: number) => (
                  <tr key={idx}>
                    <td className="py-4 font-bold text-slate-800">{item.product_name}</td>
                    <td className="py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right font-medium text-slate-500">{formatCurrency(item.unit_price, quote.currency_symbol)}</td>
                    <td className="py-4 text-right font-black text-slate-900">{formatCurrency(item.total_price, quote.currency_symbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-2 mb-12">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between items-center text-slate-500 text-sm font-bold">
                <span>Subtotal:</span>
                <span>{formatCurrency(quote.subtotal, quote.currency_symbol)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-slate-900 text-slate-900 text-xl font-black">
                <span>TOTAL:</span>
                <span>{formatCurrency(quote.total_amount, quote.currency_symbol)}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 text-slate-400 text-[10px] leading-relaxed">
            {quote.notes && (
              <div className="mb-6">
                <p className="font-black uppercase tracking-widest mb-1">Notas:</p>
                <p className="font-medium text-slate-600 text-xs">{quote.notes}</p>
              </div>
            )}
            {quote.status === 'quote' ? (
              <p className="font-bold text-slate-500">Este presupuesto es valido por 15 dias. Los precios estan sujetos a cambios sin previo aviso.</p>
            ) : (
              <p className="font-bold text-slate-500">Gracias por su compra. Comprobante emitido exitosamente.</p>
            )}
            <p className="font-medium text-slate-400 mt-2">Documento generado con BizTracker ROI.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
