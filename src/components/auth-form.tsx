'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'register'
}

export default function AuthForm({ type }: AuthFormProps) {
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl dark:bg-zinc-900/80 dark:border-zinc-800/20">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
          {type === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {type === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {type === 'login' 
            ? 'Ingresa tus credenciales para acceder a tu panel' 
            : 'Comienza a potenciar tu negocio hoy mismo'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
            Correo electrónico
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:focus:bg-zinc-800"
          />
        </div>

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
            type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-500">
          {type === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        </span>{' '}
        <a
          href={type === 'login' ? '/register' : '/login'}
          className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          {type === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
        </a>
      </div>
    </div>
  )
}
