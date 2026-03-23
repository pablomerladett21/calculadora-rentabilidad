import AuthForm from '@/components/auth-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <AuthForm type="login" />
    </div>
  )
}
