import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { APP_VERSION } from '@/version'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      // erro já setado na store
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative">
      <span className="absolute bottom-3 right-4 text-[10px] text-surface-700 select-none">v{APP_VERSION}</span>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-surface-50">Maanaim</h1>
            <p className="text-sm text-surface-500 mt-0.5">Sistema de Gestão</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-800 rounded-2xl border border-surface-700 p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-surface-100 mb-5">Entrar na conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              required
              autoFocus
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              <LogIn size={16} />
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-5">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-primary-400 hover:text-primary-300 font-medium">
              Solicitar cadastro
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
