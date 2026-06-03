import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  CalendarDays,
  Pencil,
  Trash2,
  Sparkles,
  Users,
  Droplets,
  Wrench,
  Music,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { useMovimentacoesStore } from '@/stores/movimentacoesStore'
import { formatDate, getTodayISO } from '@/lib/utils'
import {
  TIPO_ACONTECIMENTO_LABEL,
  type Acontecimento,
  type TipoAcontecimento,
} from '@/types'

const TIPO_OPTIONS = Object.entries(TIPO_ACONTECIMENTO_LABEL).map(([value, label]) => ({
  value,
  label,
}))

const TIPO_ICON: Record<TipoAcontecimento, React.ElementType> = {
  culto: BookOpen,
  evento: CalendarDays,
  batismo: Droplets,
  mutirao: Wrench,
  ensaio: Music,
  reuniao: Users,
  outro: HelpCircle,
}

const TIPO_COLOR: Record<TipoAcontecimento, string> = {
  culto: 'bg-blue-900 text-blue-300',
  evento: 'bg-purple-900 text-purple-300',
  batismo: 'bg-cyan-900 text-cyan-300',
  mutirao: 'bg-orange-900 text-orange-300',
  ensaio: 'bg-pink-900 text-pink-300',
  reuniao: 'bg-emerald-900 text-emerald-300',
  outro: 'bg-surface-700 text-surface-400',
}

const BADGE_VARIANT: Record<TipoAcontecimento, 'primary' | 'purple' | 'cyan' | 'warning' | 'success' | 'default'> = {
  culto: 'primary',
  evento: 'purple',
  batismo: 'cyan',
  mutirao: 'warning',
  ensaio: 'default',
  reuniao: 'success',
  outro: 'default',
}

type ModalState =
  | { type: 'none' }
  | { type: 'novo' }
  | { type: 'editar'; acontecimento: Acontecimento }
  | { type: 'excluir'; acontecimento: Acontecimento }

export function AcontecimentosPage() {
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoAcontecimento | 'todos'>('todos')
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const acontecimentos = useAcontecimentosStore((s) => s.acontecimentos)
  const adicionar = useAcontecimentosStore((s) => s.adicionar)
  const editar = useAcontecimentosStore((s) => s.editar)
  const remover = useAcontecimentosStore((s) => s.remover)
  const movimentacoes = useMovimentacoesStore((s) => s.movimentacoes)

  const filtrados = useMemo(() => {
    return acontecimentos.filter((a) => {
      const buscaOk =
        a.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (a.descricao ?? '').toLowerCase().includes(busca.toLowerCase())
      const tipoOk = filtroTipo === 'todos' || a.tipo === filtroTipo
      return buscaOk && tipoOk
    })
  }, [acontecimentos, busca, filtroTipo])

  const getContadorSaidas = (acontecimentoId: string) =>
    movimentacoes.filter(
      (m) => m.tipo === 'saida' && m.acontecimentoId === acontecimentoId
    ).length

  const fechar = () => setModal({ type: 'none' })

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            className="w-full h-10 bg-surface-800 border border-surface-600 rounded-lg pl-9 pr-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            placeholder="Buscar acontecimento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-surface-600 bg-surface-800 px-3 text-sm text-surface-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as TipoAcontecimento | 'todos')}
        >
          <option value="todos">Todos os tipos</option>
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Button onClick={() => setModal({ type: 'novo' })}>
          <Plus size={16} />
          Novo acontecimento
        </Button>
      </div>

      {/* Contadores por tipo */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(TIPO_ACONTECIMENTO_LABEL).map(([tipo, label]) => {
          const count = acontecimentos.filter((a) => a.tipo === tipo).length
          if (count === 0) return null
          const Icon = TIPO_ICON[tipo as TipoAcontecimento]
          return (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(filtroTipo === tipo ? 'todos' : tipo as TipoAcontecimento)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filtroTipo === tipo
                  ? 'border-primary-500 bg-primary-900 text-primary-200'
                  : 'border-surface-600 bg-surface-800 text-surface-400 hover:border-surface-500'
              }`}
            >
              <Icon size={12} />
              {label}
              <span className="ml-0.5 text-surface-500">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={busca || filtroTipo !== 'todos' ? 'Nenhum resultado' : 'Nenhum acontecimento cadastrado'}
          description={
            busca || filtroTipo !== 'todos'
              ? 'Tente ajustar os filtros.'
              : 'Cadastre os eventos, batismos, mutirões e demais acontecimentos do Maanaim.'
          }
          action={
            !busca && filtroTipo === 'todos' ? (
              <Button onClick={() => setModal({ type: 'novo' })}>
                <Plus size={16} /> Adicionar acontecimento
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtrados.map((a) => {
            const Icon = TIPO_ICON[a.tipo]
            const colorClass = TIPO_COLOR[a.tipo]
            const saidasCount = getContadorSaidas(a.id)
            return (
              <Card key={a.id} variant="bordered" className="group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`rounded-xl p-2.5 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setModal({ type: 'editar', acontecimento: a })}
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setModal({ type: 'excluir', acontecimento: a })}
                      title="Excluir"
                      className="hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-surface-100 mb-0.5 leading-tight">{a.nome}</h3>
                {a.descricao && (
                  <p className="text-xs text-surface-500 mb-2 line-clamp-2">{a.descricao}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={BADGE_VARIANT[a.tipo]}>
                      {TIPO_ACONTECIMENTO_LABEL[a.tipo]}
                    </Badge>
                    {saidasCount > 0 && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Sparkles size={9} />
                        {saidasCount} saída{saidasCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-surface-500">{formatDate(a.data)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Novo */}
      <Modal
        open={modal.type === 'novo'}
        onClose={fechar}
        title="Novo acontecimento"
        description="Cadastre um evento, batismo, mutirão ou reunião"
      >
        <AcontecimentoForm
          onSubmit={async (dados) => {
            await adicionar(dados)
            fechar()
          }}
          onCancel={fechar}
        />
      </Modal>

      {/* Modal Editar */}
      {modal.type === 'editar' && (
        <Modal open onClose={fechar} title="Editar acontecimento">
          <AcontecimentoForm
            initial={modal.acontecimento}
            onSubmit={async (dados) => {
              await editar(modal.acontecimento.id, dados)
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {/* Confirmar exclusão */}
      {modal.type === 'excluir' && (
        <ConfirmDialog
          open
          onClose={fechar}
          onConfirm={async () => {
            await remover(modal.acontecimento.id)
            fechar()
          }}
          title="Excluir acontecimento"
          description={`Deseja excluir "${modal.acontecimento.nome}"? As saídas de limpeza vinculadas não serão apagadas.`}
          confirmLabel="Excluir"
        />
      )}
    </div>
  )
}

// ─── Formulário de acontecimento ─────────────────────────────────────────────

interface AcontecimentoFormProps {
  initial?: Partial<Acontecimento>
  onSubmit: (dados: {
    nome: string
    tipo: TipoAcontecimento
    data: string
    descricao: string
  }) => Promise<void>
  onCancel: () => void
}

function AcontecimentoForm({ initial, onSubmit, onCancel }: AcontecimentoFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [tipo, setTipo] = useState<TipoAcontecimento>(initial?.tipo ?? 'culto')
  const [data, setData] = useState(initial?.data ?? getTodayISO())
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Nome é obrigatório'
    if (!data) errs.data = 'Data é obrigatória'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await onSubmit({ nome: nome.trim(), tipo, data, descricao: descricao.trim() })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome do acontecimento"
        placeholder="Ex: Culto de domingo, Batismo de jovens..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={errors.nome}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Tipo"
          options={TIPO_OPTIONS}
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoAcontecimento)}
        />
        <Input
          label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          error={errors.data}
        />
      </div>
      <Textarea
        label="Descrição (opcional)"
        placeholder="Informações adicionais sobre o acontecimento..."
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        rows={2}
      />
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Salvar alterações' : 'Cadastrar'}
        </Button>
      </ModalFooter>
    </form>
  )
}
