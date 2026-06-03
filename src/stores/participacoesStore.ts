import { create } from 'zustand'
import { ref, onValue, set as fbSet, update, remove } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { getCurrentDateISO } from '@/lib/utils'
import type { Participacao, DadosBombeiros, EquipeKey } from '@/types'

interface ParticipacaoMap {
  [equipeKey: string]: Participacao
}

interface ParticipacaoEventoMap {
  [acontecimentoId: string]: ParticipacaoMap
}

interface DadosBombeirosMap {
  [acontecimentoId: string]: DadosBombeiros
}

interface ParticipacoesState {
  participacoes: ParticipacaoEventoMap
  dadosBombeiros: DadosBombeirosMap
  loading: boolean
  _unsub: (() => void) | null
  _unsubBomb: (() => void) | null

  init: () => void
  destroy: () => void
  lancarParticipacao: (acontecimentoId: string, equipe: EquipeKey, quantidade: number, lancadoPor: string) => Promise<void>
  removerParticipacao: (acontecimentoId: string, equipe: EquipeKey) => Promise<void>
  salvarDadosBombeiros: (acontecimentoId: string, dados: Pick<DadosBombeiros, 'publicoSeminarista' | 'criancasIntermediarios'>) => Promise<void>
  getTotalVoluntarios: (acontecimentoId: string) => number
  getTotalGeral: (acontecimentoId: string) => number
}

export const useParticipacaoStore = create<ParticipacoesState>((set, get) => ({
  participacoes: {},
  dadosBombeiros: {},
  loading: false,
  _unsub: null,
  _unsubBomb: null,

  init: () => {
    set({ loading: true })
    const unsub = onValue(ref(rtdb, '/participacoes'), (snap) => {
      set({ participacoes: snap.val() ?? {}, loading: false })
    })
    const unsubBomb = onValue(ref(rtdb, '/dadosBombeiros'), (snap) => {
      set({ dadosBombeiros: snap.val() ?? {} })
    })
    set({ _unsub: unsub, _unsubBomb: unsubBomb })
  },

  destroy: () => {
    get()._unsub?.()
    get()._unsubBomb?.()
    set({ _unsub: null, _unsubBomb: null })
  },

  lancarParticipacao: async (acontecimentoId, equipe, quantidade, lancadoPor) => {
    await fbSet(ref(rtdb, `/participacoes/${acontecimentoId}/${equipe}`), {
      quantidade,
      lancadoPor,
      atualizadoEm: getCurrentDateISO(),
    })
  },

  removerParticipacao: async (acontecimentoId, equipe) => {
    await remove(ref(rtdb, `/participacoes/${acontecimentoId}/${equipe}`))
  },

  salvarDadosBombeiros: async (acontecimentoId, dados) => {
    await update(ref(rtdb, `/dadosBombeiros/${acontecimentoId}`), {
      ...dados,
      atualizadoEm: getCurrentDateISO(),
    })
  },

  getTotalVoluntarios: (acontecimentoId) => {
    const mapa = get().participacoes[acontecimentoId] ?? {}
    return Object.values(mapa).reduce((acc, p) => acc + (p.quantidade ?? 0), 0)
  },

  getTotalGeral: (acontecimentoId) => {
    const bomb = get().dadosBombeiros[acontecimentoId]
    const voluntarios = get().getTotalVoluntarios(acontecimentoId)
    const seminaris = bomb?.publicoSeminarista ?? 0
    const criancas = bomb?.criancasIntermediarios ?? 0
    return voluntarios + seminaris + criancas
  },
}))
