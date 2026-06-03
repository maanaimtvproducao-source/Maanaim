import { useMemo, useState } from 'react'
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useUsuariosStore } from '@/stores/usuariosStore'
import { EQUIPES, type EquipeKey } from '@/types'
import { formatDate } from '@/lib/utils'

type AcaoModal =
  | { tipo: 'none' }
  | { tipo: 'aprovar'; uid: string; nome: string }
  | { tipo: 'rejeitar'; uid: string; nome: string }

export function UsuariosPage() {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'aprovados'>('todos')
  const [acao, setAcao] = useState<AcaoModal>({ tipo: 'none' })
  const [actionLoading, setActionLoading] = useState(false)

  const usuarios = useUsuariosStore((s) => s.usuarios)
  const aprovar = useUsuariosStore((s) => s.aprovar)
  const rejeitar = useUsuariosStore((s) => s.rejeitar)

  const membros = useMemo(
    () => usuarios.filter((u) => u.role !== 'admin'),
    [usuarios]
  )

  const filtrados = useMemo(() => {
    return membros.filter((u) => {
      const buscaOk =
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
      const filtroOk =
        filtro === 'todos' ||
        (filtro === 'pendentes' ? !u.aprovado : u.aprovado)
      return buscaOk && filtroOk
    })
  }, [membros, busca, filtro])

  const pendentes = useMemo(() => membros.filter((u) => !u.aprovado).length, [membros])
  const aprovados = useMemo(() => membros.filter((u) => u.aprovado).length, [membros])

  const handleConfirm = async () => {
    if (acao.tipo === 'none') return
    setActionLoading(true)
    try {
      if (acao.tipo === 'aprovar') await aprovar(acao.uid)
      else await rejeitar(acao.uid)
    } finally {
      setActionLoading(false)
      setAcao({ tipo: 'none' })
    }
  }

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-surface-800 text-center">
          <p className="text-xl font-bold text-surface-50">{membros.length}</p>
          <p className="text-xs text-surface-500 mt-0.5">Total</p>
        </div>
        <div className="p-3 rounded-lg bg-surface-800 text-center">
          <p className="text-xl font-bold text-amber-400">{pendentes}</p>
          <p className="text-xs text-surface-500 mt-0.5">Pendentes</p>
        </div>
        <div className="p-3 rounded-lg bg-surface-800 text-center">
          <p className="text-xl font-bold text-emerald-400">{aprovados}</p>
          <p className="text-xs text-surface-500 mt-0.5">Aprovados</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            className="w-full h-10 bg-surface-800 border border-surface-600 rounded-lg pl-9 pr-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg bg-surface-800 border border-surface-700 p-1 gap-1">
          {(['todos', 'pendentes', 'aprovados'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filtro === f ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <EmptyState
          icon={Users}
          title={busca || filtro !== 'todos' ? 'Nenhum resultado' : 'Nenhum usuário cadastrado'}
          description={
            pendentes === 0 && filtro === 'pendentes'
              ? 'Não há solicitações de cadastro pendentes.'
              : 'Os usuários cadastrados aparecerão aqui.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtrados.map((u) => (
            <Card key={u.uid} variant="bordered" className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-surface-100">{u.nome}</p>
                  {u.aprovado ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <ShieldCheck size={10} /> Aprovado
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <Clock size={10} /> Pendente
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5">{u.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {u.equipe && u.equipe !== 'ADMIN' && (
                    <Badge variant="primary" className="text-xs">
                      {EQUIPES[u.equipe as EquipeKey] ?? u.equipe}
                    </Badge>
                  )}
                  <span className="text-xs text-surface-600">
                    Cadastro: {formatDate(u.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!u.aprovado && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => setAcao({ tipo: 'aprovar', uid: u.uid, nome: u.nome })}
                  >
                    <CheckCircle size={14} />
                    Aprovar
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setAcao({ tipo: 'rejeitar', uid: u.uid, nome: u.nome })}
                >
                  <XCircle size={14} />
                  {u.aprovado ? 'Remover' : 'Recusar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={acao.tipo === 'aprovar'}
        onClose={() => setAcao({ tipo: 'none' })}
        onConfirm={handleConfirm}
        title="Aprovar usuário"
        description={`Deseja aprovar o cadastro de "${acao.tipo !== 'none' ? acao.nome : ''}"? Ele terá acesso ao sistema.`}
        confirmLabel="Aprovar"
        loading={actionLoading}
        variant="warning"
      />
      <ConfirmDialog
        open={acao.tipo === 'rejeitar'}
        onClose={() => setAcao({ tipo: 'none' })}
        onConfirm={handleConfirm}
        title="Remover usuário"
        description={`Deseja remover "${acao.tipo !== 'none' ? acao.nome : ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={actionLoading}
      />
    </div>
  )
}
