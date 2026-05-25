'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface ResetPasswordFormProps {
  redirectPath: string
}

export default function ResetPasswordForm({ redirectPath }: ResetPasswordFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const verifySession = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (!active) return

      if (error || !data.user) {
        setError('El enlace de recuperacion no es valido o ya expiro. Vuelve a pedir uno nuevo.')
        setHasSession(false)
      } else {
        setHasSession(true)
      }

      setCheckingSession(false)
    }

    void verifySession()

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (password.length < 8) {
        throw new Error('La contrasena debe tener al menos 8 caracteres.')
      }

      if (password !== confirmPassword) {
        throw new Error('Las contrasenas no coinciden.')
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) throw updateError

      setMessage('Contrasena actualizada. En unos segundos te llevamos al panel.')
      setTimeout(() => {
        router.replace(redirectPath)
      }, 1400)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contrasena.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl dark:bg-zinc-900/80 dark:border-zinc-800/20">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
          <KeyRound size={24} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Crear nueva contrasena
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Elegi una nueva contrasena para volver a entrar a tu cuenta.
        </p>
      </div>

      {checkingSession ? (
        <div className="py-10 flex items-center justify-center text-zinc-500">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : hasSession ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
              Nueva contrasena
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:focus:bg-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="confirm-password">
              Repetir contrasena
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Repeti tu contrasena"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Guardar nueva contrasena'}
          </button>
          
          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Volver a iniciar sesion
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <p className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            Volver a iniciar sesion
          </Link>
        </div>
      )}
    </div>
  )
}
