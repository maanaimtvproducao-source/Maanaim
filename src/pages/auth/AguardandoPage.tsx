import { Clock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { EQUIPES, type EquipeKey } from '@/types'

export function AguardandoPage() {
  const userData = useAuthStore((s) => s.userData)
  const logout = useAuthStore((s) => s.logout)

  const equipeLabel =
    userData?.equipe && userData.equipe !== 'ADMIN'
      ? EQUIPES[userData.equipe as EquipeKey]
      : ''

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-amber-900/50 border-2 border-amber-700 flex items-center justify-center">
            <Clock className="h-10 w-10 text-amber-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-surface-50 mb-2">Aguardando aprovação</h1>

        <p className="text-surface-400 text-sm mb-1">
          Olá, <span className="text-surface-200 font-medium">{userData?.nome}</span>!
        </p>
        {equipeLabel && (
          <p className="text-surface-500 text-sm mb-6">
            Equipe: <span className="text-primary-400 font-medium">{equipeLabel}</span>
          </p>
        )}

        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5 mb-6 text-left">
          <p className="text-sm text-surface-300 leading-relaxed">
            Seu cadastro foi registrado com sucesso. Um administrador precisa aprovar sua conta
            antes de você ter acesso ao sistema.
          </p>
          <p className="text-sm text-surface-500 mt-2">
            Entre em contato com a liderança do Maanaim para agilizar a aprovação.
          </p>
        </div>

        <Button variant="secondary" onClick={logout} className="w-full">
          <LogOut size={16} />
          Sair
        </Button>
      </div>
    </div>
  )
}
