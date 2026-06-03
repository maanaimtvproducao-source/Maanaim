import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Save, Flame } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { useParticipacaoStore } from '@/stores/participacoesStore'
import { formatDate } from '@/lib/utils'
import { TIPO_ACONTECIMENTO_LABEL, EQUIPES, EQUIPES_ORDENADAS } from '@/types'
import type { Acontecimento } from '@/types'

function NumericInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-surface-400 uppercase tracking-wide">{label}</label>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-surface-600 bg-surface-700 px-3 text-sm text-surface-100 text-right font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  )
}

function AcontecimentoRow({ acontecimento }: { acontecimento: Acontecimento }) {
  const [expandido, setExpandido] = useState(false)
  const [seminaris, setSeminaris] = useState('')
  const [criancas, setCriancas] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const participacoes = useParticipacaoStore((s) => s.participacoes)
  const dadosBombeiros = useParticipacaoStore((s) => s.dadosBombeiros)
  const getTotalVoluntarios = useParticipacaoStore((s) => s.getTotalVoluntarios)
  const getTotalGeral = useParticipacaoStore((s) => s.getTotalGeral)
  const salvarDadosBombeiros = useParticipacaoStore((s) => s.salvarDadosBombeiros)

  const dbDados = dadosBombeiros[acontecimento.id]

  // Sincroniza campos quando dados chegam do Firebase
  useMemo(() => {
    if (dbDados) {
      setSeminaris(String(dbDados.publicoSeminarista ?? 0))
      setCriancas(String(dbDados.criancasIntermediarios ?? 0))
    }
  }, [dbDados])

  const participacoesEvento = participacoes[acontecimento.id] ?? {}
  const totalVoluntarios = getTotalVoluntarios(acontecimento.id)
  const totalGeral = getTotalGeral(acontecimento.id)

  const handleSalvar = async () => {
    setSaving(true)
    try {
      await salvarDadosBombeiros(acontecimento.id, {
        publicoSeminarista: Number(seminaris) || 0,
        criancasIntermediarios: Number(criancas) || 0,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="bordered">
      {/* Cabeçalho do evento */}
      <button
        className="w-full flex items-start justify-between gap-3 text-left"
        onClick={() => setExpandido((v) => !v)}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-surface-100">{acontecimento.nome}</span>
            <Badge variant="purple">{TIPO_ACONTECIMENTO_LABEL[acontecimento.tipo]}</Badge>
          </div>
          <p className="text-xs text-surface-500 mt-0.5">{formatDate(acontecimento.data)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-primary-400">{totalGeral}</p>
            <p className="text-xs text-surface-500">Total geral</p>
          </div>
          {expandido ? <ChevronDown size={16} className="text-surface-500" /> : <ChevronRight size={16} className="text-surface-500" />}
        </div>
      </button>

      {expandido && (
        <div className="mt-4 space-y-4">
          {/* Tabela de equipes */}
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">
              Voluntários por equipe
            </p>
            <div className="rounded-lg border border-surface-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-700">
                    <th className="text-left px-3 py-2 text-xs font-medium text-surface-400">Equipe</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-surface-400">Qtd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {EQUIPES_ORDENADAS.map((equipeKey) => {
                    const p = participacoesEvento[equipeKey]
                    return (
                      <tr key={equipeKey} className={p ? 'bg-surface-800' : 'bg-surface-800/40'}>
                        <td className={`px-3 py-2 ${p ? 'text-surface-200' : 'text-surface-600'}`}>
                          {EQUIPES[equipeKey]}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono font-medium ${p ? 'text-surface-100' : 'text-surface-600'}`}>
                          {p ? p.quantidade : '—'}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-primary-900/40 font-semibold">
                    <td className="px-3 py-2 text-primary-300">Total de Voluntários</td>
                    <td className="px-3 py-2 text-right font-mono text-primary-300">{totalVoluntarios}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Campos editáveis */}
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3">
              Público não voluntário
            </p>
            <div className="grid grid-cols-2 gap-3">
              <NumericInput
                label="Público Seminárista"
                value={seminaris}
                onChange={setSeminaris}
              />
              <NumericInput
                label="Crianças / Intermediários"
                value={criancas}
                onChange={setCriancas}
              />
            </div>
          </div>

          {/* Totalizadores */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{totalVoluntarios}</p>
              <p className="text-xs text-surface-500">Total Voluntários</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{totalGeral}</p>
              <p className="text-xs text-surface-500">Total Geral</p>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSalvar}
            loading={saving}
            variant={saved ? 'success' : 'primary'}
          >
            <Save size={14} />
            {saved ? 'Salvo!' : 'Salvar dados de público'}
          </Button>
        </div>
      )}
    </Card>
  )
}

export function BombeirosPage() {
  const acontecimentos = useAcontecimentosStore((s) => s.acontecimentos)

  const ordenados = useMemo(
    () => [...acontecimentos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [acontecimentos]
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-900/30 border border-orange-800/40">
        <div className="h-10 w-10 rounded-xl bg-orange-700 flex items-center justify-center shrink-0">
          <Flame size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-surface-100">Bombeiros</p>
          <p className="text-xs text-surface-400">
            Visualização consolidada de participantes por acontecimento
          </p>
        </div>
      </div>

      {ordenados.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Nenhum acontecimento cadastrado"
          description="Os acontecimentos são cadastrados pelo administrador."
        />
      ) : (
        <div className="space-y-3">
          {ordenados.map((ac) => (
            <AcontecimentoRow key={ac.id} acontecimento={ac} />
          ))}
        </div>
      )}
    </div>
  )
}
