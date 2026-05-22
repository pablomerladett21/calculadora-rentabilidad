import type { Metadata } from 'next'
import LandingPage from '@/components/marketing/landing-page'

export const metadata: Metadata = {
  title: 'Rentabilidad, stock y presupuestos para talleres',
  description:
    'Una app simple para talleres y negocios de producción que quieren saber si ganan plata, controlar stock y convertir presupuestos en ventas.',
  keywords: ['rentabilidad', 'stock', 'presupuestos', 'talleres', 'producción', 'ventas'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rentabilidad, stock y presupuestos para talleres',
    description:
      '15 días gratis, sin tarjeta. Después USD 12/mes para talleres y negocios de producción.',
    type: 'website',
  },
}

export default function Home() {
  return <LandingPage />
}
