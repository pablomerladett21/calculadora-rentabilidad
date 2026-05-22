import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BizTracker ROI',
    template: '%s | BizTracker ROI',
  },
  description: 'Rentabilidad, stock, presupuestos y ventas para talleres y negocios de producción.',
  applicationName: 'BizTracker ROI',
  keywords: ['rentabilidad', 'stock', 'presupuestos', 'ventas', 'talleres', 'producción'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
