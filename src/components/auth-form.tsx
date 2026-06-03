'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { KeyRound, LogIn, Loader2, UserPlus } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot'
  redirectPath: string
}

export default function AuthForm({ type, redirectPath }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (type === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
          },
        })

        if (signUpError) throw signUpError
        setMessage('Revisa tu correo para confirmar tu cuenta.')
      } else if (type === 'forgot') {
        const recoveryRedirect = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(`/reset-password?redirect=${encodeURIComponent(redirectPath)}`)}`
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: recoveryRedirect,
        })

        if (resetError) throw resetError

        setMessage('Te enviamos un enlace para recuperar tu contrasena.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError
        window.location.href = redirectPath
      }
    } catch (err: any) {
      if (err.status === 400 && type === 'login') {
        setError('Correo o contraseña incorrectos.')
      } else if (err.status === 422 && type === 'register') {
        setError('El correo ingresado no es válido o ya está en uso.')
      } else {
        setError('Ocurrió un error al procesar tu solicitud. Por favor intenta más tarde.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isForgot = type === 'forgot'
  const isLogin = type === 'login'
  const isRegister = type === 'register'

  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl dark:bg-zinc-900/80 dark:border-zinc-800/20">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
          {isLogin ? <LogIn size={24} /> : isRegister ? <UserPlus size={24} /> : <KeyRound size={24} />}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isLogin ? 'Bienvenido de nuevo' : isRegister ? 'Crea tu cuenta' : 'Recupera tu contrasena'}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {isLogin
            ? 'Ingresa tus credenciales para acceder a tu panel'
            : isRegister
              ? 'Comienza a potenciar tu negocio hoy mismo'
              : 'Te enviaremos un enlace para crear una nueva contrasena'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:focus:bg-zinc-800"
          />
        </div>

        {!isForgot && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:focus:bg-zinc-800"
            />
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            isLogin ? 'Iniciar sesion' : isRegister ? 'Crear cuenta' : 'Enviar enlace'
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        {isLogin && (
          <Link
            href={`/forgot-password?redirect=${encodeURIComponent(redirectPath)}`}
            className="block font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Olvide mi contrasena
          </Link>
        )}
        <div>
          <span className="text-zinc-500">
            {isLogin ? 'No tienes cuenta?' : isRegister ? 'Ya tienes cuenta?' : 'Recuerdas tu contrasena?'}
          </span>{' '}
          <Link
            href={isLogin ? '/register' : '/login'}
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {isLogin ? 'Registrate aqui' : isRegister ? 'Inicia sesion' : 'Volver a iniciar sesion'}
          </Link>
        </div>
      </div>
    </div>
  )
}
