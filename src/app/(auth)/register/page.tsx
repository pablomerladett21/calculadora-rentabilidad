import AuthForm from '@/components/auth-form'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>
}) {
  const resolvedSearchParams = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <AuthForm type="register" redirectPath={resolvedSearchParams?.redirect || '/dashboard'} />
    </div>
  )
}
