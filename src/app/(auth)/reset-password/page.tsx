import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Nueva contrasena',
  description: 'Crea una nueva contrasena para volver a entrar a tu cuenta.',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>
}) {
  const resolvedSearchParams = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <ResetPasswordForm redirectPath={resolvedSearchParams?.redirect || '/dashboard'} />
    </div>
  )
}
