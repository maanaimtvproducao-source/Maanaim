import { create } from 'zustand'
import { ref, onValue, update, remove } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { generateId, getCurrentDateISO } from '@/lib/utils'
import type { Acontecimento, TipoAcontecimento } from '@/types'

interface AcontecimentosState {
  acontecimentos: Acontecimento[]
  loading: boolean
  error: string | null
  _unsub: (() => void) | null

  init: () => void
  destroy: () => void
  adicionar: (dados: {
    nome: string
    tipo: TipoAcontecimento
    data: string
    descricao?: string
  }) => Promise<Acontecimento>
  editar: (id: string, dados: Partial<Omit<Acontecimento, 'id' | 'createdAt'>>) => Promise<void>
  remover: (id: string) => Promise<void>
}

export const useAcontecimentosStore = create<AcontecimentosState>((set, get) => ({
  acontecimentos: [],
  loading: false,
  error: null,
  _unsub: null,

  init: () => {
    set({ loading: true })
    const unsub = onValue(ref(rtdb, '/acontecimentos'), (snap) => {
      const val = snap.val() ?? {}
      const acontecimentos: Acontecimento[] = Object.entries(val).map(([id, data]) => ({
        id,
        ...(data as Omit<Acontecimento, 'id'>),
      }))
      acontecimentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      set({ acontecimentos, loading: false })
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
    const ac: Acontecimento = {
      id,
      descricao: '',
      ...dados,
      createdAt: getCurrentDateISO(),
    }
    const { descricao, ...rest } = ac
    const toSave = descricao ? ac : rest
    await update(ref(rtdb, `/acontecimentos/${id}`), toSave)
    return ac
  },

  editar: async (id, dados) => {
    await update(ref(rtdb, `/acontecimentos/${id}`), dados)
  },

  remover: async (id) => {
    await remove(ref(rtdb, `/acontecimentos/${id}`))
  },
}))
