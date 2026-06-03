import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ModalFooter } from '@/components/ui/Modal'
import { UNIDADE_LABEL, type TipoAcontecimento } from '@/types'
import type { Produto } from '@/types'
import { getTodayISO, formatDate } from '@/lib/utils'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { TIPO_ACONTECIMENTO_LABEL } from '@/types'

interface MovimentacaoRapidaFormProps {
  produto: Produto
  tipo: 'entrada' | 'saida'
  showAcontecimento?: boolean
  onSubmit: (dados: {
    quantidade: number
    data: string
    observacao: string
    acontecimentoId?: string
    tipoAcontecimento?: TipoAcontecimento
    nomeAcontecimento?: string
    responsavel?: string
  }) => Promise<void>
  onCancel: () => void
}

export function MovimentacaoRapidaForm({
  produto,
  tipo,
  showAcontecimento = false,
  onSubmit,
  onCancel,
}: MovimentacaoRapidaFormProps) {
  const [quantidade, setQuantidade] = useState('1')
  const [data, setData] = useState(getTodayISO())
  const [observacao, setObservacao] = useState('')
  const [acontecimentoId, setAcontecimentoId] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const acontecimentos = useAcontecimentosStore((s) => s.acontecimentos)

  // Acontecimentos ordenados do mais recente para o mais antigo
  const acontecimentosOrdenados = useMemo(
    () => [...acontecimentos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [acontecimentos]
  )

  const acontecimentoSelecionado = acontecimentos.find((a) => a.id === acontecimentoId)

  const validate = () => {
    const errs: Record<string, string> = {}
    const qtd = Number(quantidade)
    if (isNaN(qtd) || qtd <= 0) errs.quantidade = 'Informe uma quantidade válida'
    if (tipo === 'saida' && qtd > produto.quantidadeAtual)
      errs.quantidade = `Estoque insuficiente (disponível: ${produto.quantidadeAtual})`
    if (!data) errs.data = 'Informe a data'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await onSubmit({
        quantidade: Number(quantidade),
        data,
        observacao: observacao.trim(),
        ...(showAcontecimento && tipo === 'saida'
          ? {
              acontecimentoId: acontecimentoId || undefined,
              tipoAcontecimento: acontecimentoSelecionado?.tipo,
              nomeAcontecimento: acontecimentoSelecionado?.nome,
              responsavel: responsavel.trim(),
            }
          : {}),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Info do produto */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-700">
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-100">{produto.nome}</p>
          <p className="text-xs text-surface-400">
            Estoque atual: {produto.quantidadeAtual} {UNIDADE_LABEL[produto.unidade]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`Quantidade (${UNIDADE_LABEL[produto.unidade]})`}
          type="number"
          min="1"
          step="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          error={errors.quantidade}
          autoFocus
        />
        <Input
          label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          error={errors.data}
        />
      </div>

      {/* Seleção de acontecimento (apenas para saídas de limpeza) */}
      {showAcontecimento && tipo === 'saida' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-200">
            Acontecimento vinculado
          </label>
          {acontecimentosOrdenados.length === 0 ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-surface-600 bg-surface-800/50">
              <div className="flex items-center gap-2 text-surface-500 text-sm">
                <CalendarDays size={15} />
                <span>Nenhum acontecimento cadastrado</span>
              </div>
              <Link to="/acontecimentos" onClick={onCancel}>
                <Button variant="ghost" size="sm" type="button">
                  <Plus size={13} /> Cadastrar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-surface-600 divide-y divide-surface-700">
              {/* Opção "sem vínculo" */}
              <button
                type="button"
                onClick={() => setAcontecimentoId('')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  acontecimentoId === ''
                    ? 'bg-surface-600 text-surface-100'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                <span className="text-sm">Nenhum (saída avulsa)</span>
              </button>

              {acontecimentosOrdenados.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAcontecimentoId(a.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors ${
                    acontecimentoId === a.id
                      ? 'bg-primary-800 text-white'
                      : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.nome}</p>
                    <p className="text-xs text-surface-500">
                      {TIPO_ACONTECIMENTO_LABEL[a.tipo]} · {formatDate(a.data)}
                    </p>
                  </div>
                  {acontecimentoId === a.id && (
                    <div className="w-2 h-2 rounded-full bg-primary-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {(showAcontecimento && tipo === 'saida') && (
        <Input
          label="Responsável (opcional)"
          placeholder="Quem retirou..."
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        />
      )}

      <Textarea
        label="Observação (opcional)"
        placeholder="Alguma anotação..."
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
        rows={2}
      />

      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant={tipo === 'entrada' ? 'success' : 'danger'}
          loading={loading}
        >
          {tipo === 'entrada' ? 'Registrar entrada' : 'Registrar saída'}
        </Button>
      </ModalFooter>
    </form>
  )
}
