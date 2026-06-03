import { create } from 'zustand'
import { ref, onValue, update, remove, get as fbGet } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { generateId, getCurrentDateISO } from '@/lib/utils'
import type { Produto, Setor, UnidadeMedida } from '@/types'

interface ProdutosState {
  produtos: Produto[]
  loading: boolean
  error: string | null
  _unsub: (() => void) | null

  init: () => void
  destroy: () => void
  adicionar: (dados: {
    nome: string
    descricao?: string
    unidade: UnidadeMedida
    setor: Setor
    quantidadeAtual: number
    quantidadeMinima: number
  }) => Promise<Produto>
  editar: (id: string, dados: Partial<Omit<Produto, 'id' | 'createdAt'>>) => Promise<void>
  remover: (id: string) => Promise<void>
  atualizarQuantidade: (id: string, delta: number) => Promise<void>
}

export const useProdutosStore = create<ProdutosState>((set, get) => ({
  produtos: [],
  loading: false,
  error: null,
  _unsub: null,

  init: () => {
    set({ loading: true })
    const unsub = onValue(ref(rtdb, '/produtos'), (snap) => {
      const val = snap.val() ?? {}
      const produtos: Produto[] = Object.entries(val).map(([id, data]) => ({
        id,
        ...(data as Omit<Produto, 'id'>),
      }))
      produtos.sort((a, b) => a.nome.localeCompare(b.nome))
      set({ produtos, loading: false })
    }, (err) => {
      set({ error: err.message, loading: false })
    })
    set({ _unsub: unsub })
  },

  destroy: () => {
    get()._unsub?.()
    set({ _unsub: null })
  },

  adicionar: async (dados) => {
    const id = generateId()
    const now = getCurrentDateISO()
    const produto: Produto = { id, ...dados, createdAt: now, updatedAt: now }
    await update(ref(rtdb, `/produtos/${id}`), produto)
    return produto
  },

  editar: async (id, dados) => {
    await update(ref(rtdb, `/produtos/${id}`), { ...dados, updatedAt: getCurrentDateISO() })
  },

  remover: async (id) => {
    await remove(ref(rtdb, `/produtos/${id}`))
  },

  atualizarQuantidade: async (id, delta) => {
    const snap = await fbGet(ref(rtdb, `/produtos/${id}/quantidadeAtual`))
    const atual: number = snap.val() ?? 0
    const nova = Math.max(0, atual + delta)
    await update(ref(rtdb, `/produtos/${id}`), {
      quantidadeAtual: nova,
      updatedAt: getCurrentDateISO(),
    })
  },
}))
