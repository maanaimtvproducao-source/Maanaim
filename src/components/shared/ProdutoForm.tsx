import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ModalFooter } from '@/components/ui/Modal'
import { UNIDADE_LABEL, type Setor, type UnidadeMedida } from '@/types'
import type { Produto } from '@/types'

const UNIDADE_OPTIONS = Object.entries(UNIDADE_LABEL).map(([value, label]) => ({ value, label }))

interface ProdutoFormProps {
  setor: Setor
  initial?: Partial<Produto>
  onSubmit: (dados: {
    nome: string
    descricao: string
    unidade: UnidadeMedida
    quantidadeAtual: number
    quantidadeMinima: number
  }) => Promise<void>
  onCancel: () => void
}

export function ProdutoForm({ setor: _setor, initial, onSubmit, onCancel }: ProdutoFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [unidade, setUnidade] = useState<UnidadeMedida>(initial?.unidade ?? 'unidade')
  const [quantidadeAtual, setQuantidadeAtual] = useState(String(initial?.quantidadeAtual ?? 0))
  const [quantidadeMinima, setQuantidadeMinima] = useState(String(initial?.quantidadeMinima ?? 1))
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Nome é obrigatório'
    if (isNaN(Number(quantidadeAtual)) || Number(quantidadeAtual) < 0)
      errs.quantidadeAtual = 'Quantidade inválida'
    if (isNaN(Number(quantidadeMinima)) || Number(quantidadeMinima) < 0)
      errs.quantidadeMinima = 'Quantidade mínima inválida'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim(),
        unidade,
        quantidadeAtual: Number(quantidadeAtual),
        quantidadeMinima: Number(quantidadeMinima),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome do produto"
        placeholder="Ex: Detergente, Papel A4..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={errors.nome}
        autoFocus
      />
      <Textarea
        label="Descrição (opcional)"
        placeholder="Informações adicionais..."
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        rows={2}
      />
      <Select
        label="Unidade de medida"
        options={UNIDADE_OPTIONS}
        value={unidade}
        onChange={(e) => setUnidade(e.target.value as UnidadeMedida)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Qtd. atual"
          type="number"
          min="0"
          step="1"
          value={quantidadeAtual}
          onChange={(e) => setQuantidadeAtual(e.target.value)}
          error={errors.quantidadeAtual}
        />
        <Input
          label="Qtd. mínima"
          type="number"
          min="0"
          step="1"
          value={quantidadeMinima}
          onChange={(e) => setQuantidadeMinima(e.target.value)}
          error={errors.quantidadeMinima}
          hint="Alerta de estoque baixo"
        />
      </div>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Salvar alterações' : 'Adicionar produto'}
        </Button>
      </ModalFooter>
    </form>
  )
}
