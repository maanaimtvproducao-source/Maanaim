import { create } from 'zustand'
import { ref, onValue, update, remove } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { generateId, getCurrentDateISO, getTodayISO } from '@/lib/utils'
import { useProdutosStore } from './produtosStore'
import type { Movimentacao, Setor, TipoAcontecimento } from '@/types'

interface MovimentacoesState {
  movimentacoes: Movimentacao[]
  loading: boolean
  error: string | null
  _unsub: (() => void) | null

  init: () => void
  destroy: () => void
  getPorProduto: (produtoId: string) => Movimentacao[]
  registrarEntrada: (dados: {
    produtoId: string
    quantidade: number
    setor: Setor
    data?: string
    observacao?: string
    responsavel?: string
  }) => Promise<void>
  registrarSaida: (dados: {
    produtoId: string
    quantidade: number
    setor: Setor
    data?: string
    observacao?: string
    acontecimentoId?: string
    tipoAcontecimento?: TipoAcontecimento
    nomeAcontecimento?: string
    responsavel?: string
  }) => Promise<void>
  remover: (id: string) => Promise<void>
}

function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>
}

export const useMovimentacoesStore = create<MovimentacoesState>((set, get) => ({
  movimentacoes: [],
  loading: false,
  error: null,
  _unsub: null,

  init: () => {
    set({ loading: true })
    const unsub = onValue(ref(rtdb, '/movimentacoes'), (snap) => {
      const val = snap.val() ?? {}
      const movimentacoes: Movimentacao[] = Object.entries(val).map(([id, data]) => ({
        id,
        ...(data as Omit<Movimentacao, 'id'>),
      }))
      movimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      set({ movimentacoes, loading: false })
    }, (err) => {
      set({ error: err.message, loading: false })
    })
    set({ _unsub: unsub })
  },

  destroy: () => {
    get()._unsub?.()
    set({ _unsub: null })
  },

  getPorProduto: (produtoId) =>
    get().movimentacoes.filter((m) => m.produtoId === produtoId),

  registrarEntrada: async (dados) => {
    const id = generateId()
    const mov: Movimentacao = cleanObject({
      id,
      tipo: 'entrada' as const,
      data: dados.data ?? getTodayISO(),
      createdAt: getCurrentDateISO(),
      ...dados,
    }) as Movimentacao
    await update(ref(rtdb, `/movimentacoes/${id}`), mov)
    await useProdutosStore.getState().atualizarQuantidade(dados.produtoId, dados.quantidade)
  },

  registrarSaida: async (dados) => {
    const id = generateId()
    const mov: Movimentacao = cleanObject({
      id,
      tipo: 'saida' as const,
      data: dados.data ?? getTodayISO(),
      createdAt: getCurrentDateISO(),
      ...dados,
    }) as Movimentacao
    await update(ref(rtdb, `/movimentacoes/${id}`), mov)
    await useProdutosStore.getState().atualizarQuantidade(dados.produtoId, -dados.quantidade)
  },

  remover: async (id) => {
    const mov = get().movimentacoes.find((m) => m.id === id)
    if (!mov) return
    await remove(ref(rtdb, `/movimentacoes/${id}`))
    const delta = mov.tipo === 'entrada' ? -mov.quantidade : mov.quantidade
    await useProdutosStore.getState().atualizarQuantidade(mov.produtoId, delta)
  },
}))
