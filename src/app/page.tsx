import type { Metadata } from 'next'
import LandingPage from '@/components/marketing/landing-page'

export const metadata: Metadata = {
  title: 'Herramienta para talleres que quieren vender con margen',
  description:
    'Deja Excel, mira tu margen real, controla stock y convierte presupuestos en ventas con una app simple para talleres y negocios de producción.',
  keywords: ['rentabilidad', 'stock', 'presupuestos', 'talleres', 'produccion', 'ventas'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Herramienta para talleres que quieren vender con margen',
    description:
      'Plan 100% gratis disponible. Controla stock y convierte presupuestos en ventas.',
    type: 'website',
  },
}

export default function Home() {
  return <LandingPage />
}
