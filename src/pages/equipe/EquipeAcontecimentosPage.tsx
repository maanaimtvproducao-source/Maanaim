import { useState, useMemo } from 'react'
import { CalendarDays, Users, Pencil, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { useParticipacaoStore } from '@/stores/participacoesStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/utils'
import { TIPO_ACONTECIMENTO_LABEL, EQUIPES, type EquipeKey } from '@/types'
import type { Acontecimento } from '@/types'

interface LancarModalState {
  open: boolean
  acontecimento: Acontecimento | null
}

export function EquipeAcontecimentosPage() {
  const [modalState, setModalState] = useState<LancarModalState>({ open: false, acontecimento: null })
  const [quantidade, setQuantidade] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const acontecimentos = useAcontecimentosStore((s) => s.acontecimentos)
  const participacoes = useParticipacaoStore((s) => s.participacoes)
  const lancarParticipacao = useParticipacaoStore((s) => s.lancarParticipacao)

  const userData = useAuthStore((s) => s.userData)
  const equipe = userData?.equipe as EquipeKey | undefined
  const equipeLabel = equipe ? EQUIPES[equipe] : ''

  const getMinhaParticipacao = (acontecimentoId: string) =>
    equipe ? participacoes[acontecimentoId]?.[equipe] : undefined

  const abrirModal = (acontecimento: Acontecimento) => {
    const existente = getMinhaParticipacao(acontecimento.id)
    setQuantidade(existente ? String(existente.quantidade) : '')
    setErro('')
    setModalState({ open: true, acontecimento })
  }

  const fechar = () => setModalState({ open: false, acontecimento: null })

  const handleSalvar = async () => {
    if (!equipe || !userData || !modalState.acontecimento) return
    const qtd = Number(quantidade)
    if (isNaN(qtd) || qtd < 0) {
      setErro('Informe um número válido.')
      return
    }
    setLoading(true)
    try {
      await lancarParticipacao(modalState.acontecimento.id, equipe, qtd, userData.nome)
      fechar()
    } finally {
      setLoading(false)
    }
  }

  const acontecimentosOrdenados = useMemo(
    () => [...acontecimentos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [acontecimentos]
  )

  return (
    <div className="space-y-5">
      {/* Cabeçalho de equipe */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-900/30 border border-primary-800/40">
        <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <Users size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-surface-100">{equipeLabel}</p>
          <p className="text-xs text-surface-400">Lançamento de participantes por acontecimento</p>
        </div>
      </div>

      {/* Lista de acontecimentos */}
      {acontecimentosOrdenados.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum acontecimento cadastrado"
          description="Os acontecimentos são cadastrados pelo administrador."
        />
      ) : (
        <div className="space-y-3">
          {acontecimentosOrdenados.map((ac) => {
            const minha = getMinhaParticipacao(ac.id)
            return (
              <Card key={ac.id} variant="bordered">
                <CardHeader>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle>{ac.nome}</CardTitle>
                      <Badge variant="purple">{TIPO_ACONTECIMENTO_LABEL[ac.tipo]}</Badge>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{formatDate(ac.data)}</p>
                    {ac.descricao && (
                      <p className="text-xs text-surface-400 mt-0.5">{ac.descricao}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={minha ? 'secondary' : 'primary'}
                    onClick={() => abrirModal(ac)}
                  >
                    {minha ? <Pencil size={13} /> : <Users size={13} />}
                    {minha ? 'Editar' : 'Lançar'}
                  </Button>
                </CardHeader>
                {minha && (
                  <CardContent>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-900/30 border border-emerald-800/40">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-sm text-emerald-300">
                        Participação lançada:{' '}
                        <span className="font-bold">{minha.quantidade}</span> pessoa{minha.quantidade !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de lançamento */}
      <Modal
        open={modalState.open}
        onClose={fechar}
        title={`Lançar participação — ${equipeLabel}`}
        description={modalState.acontecimento?.nome}
        size="sm"
      >
        <div className="space-y-4">
          {modalState.acontecimento && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-700">
              <Badge variant="purple">{TIPO_ACONTECIMENTO_LABEL[modalState.acontecimento.tipo]}</Badge>
              <span className="text-sm text-surface-400">{formatDate(modalState.acontecimento.data)}</span>
            </div>
          )}
          <Input
            label="Quantidade de participantes da sua equipe"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={quantidade}
            onChange={(e) => { setQuantidade(e.target.value); setErro('') }}
            error={erro}
            autoFocus
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={fechar} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} loading={loading}>
            <Check size={14} /> Salvar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
