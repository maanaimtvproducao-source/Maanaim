import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { EQUIPES, EQUIPES_ORDENADAS, type EquipeKey } from '@/types'

const EQUIPE_OPTIONS = EQUIPES_ORDENADAS.map((key) => ({
  value: key,
  label: EQUIPES[key],
}))

export function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [equipe, setEquipe] = useState<EquipeKey | ''>('')
  const [loading, setLoading] = useState(false)
  const [senhaError, setSenhaError] = useState('')

  const register = useAuthStore((s) => s.register)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSenhaError('')

    if (!equipe) return
    if (password !== confirmar) {
      setSenhaError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setSenhaError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await register({ nome, email, password, equipe })
      navigate('/aguardando')
    } catch {
      // erro já setado na store
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-surface-50">Maanaim</h1>
            <p className="text-sm text-surface-500 mt-0.5">Solicitar acesso</p>
          </div>
        </div>

        <div className="bg-surface-800 rounded-2xl border border-surface-700 p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-surface-100 mb-1">Criar conta</h2>
          <p className="text-xs text-surface-500 mb-5">
            Após o cadastro, sua conta precisará ser aprovada por um administrador.
          </p>

          {(error || senhaError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-800/50 text-red-300 text-sm">
              {error || senhaError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              required
            />
            <Select
              label="Equipe"
              options={EQUIPE_OPTIONS}
              value={equipe}
              onChange={(e) => setEquipe(e.target.value as EquipeKey)}
              placeholder="Selecione sua equipe"
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSenhaError('') }}
              required
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmar}
              onChange={(e) => { setConfirmar(e.target.value); setSenhaError('') }}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              <UserPlus size={16} />
              Solicitar cadastro
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-5">
            Já tem conta?{' '}
            <Link to="/" className="text-primary-400 hover:text-primary-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
