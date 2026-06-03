import { create } from 'zustand'
import { ref, onValue, update, remove } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import type { Usuario } from '@/types'

interface UsuariosState {
  usuarios: Usuario[]
  loading: boolean
  _unsub: (() => void) | null

  init: () => void
  destroy: () => void
  aprovar: (uid: string) => Promise<void>
  rejeitar: (uid: string) => Promise<void>
}

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [],
  loading: false,
  _unsub: null,

  init: () => {
    set({ loading: true })
    const unsub = onValue(ref(rtdb, '/usuarios'), (snap) => {
      const val = snap.val() ?? {}
      const usuarios: Usuario[] = Object.entries(val).map(([uid, data]) => ({
        uid,
        ...(data as Omit<Usuario, 'uid'>),
      }))
      usuarios.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      set({ usuarios, loading: false })
    })
    set({ _unsub: unsub })
  },

  destroy: () => {
    get()._unsub?.()
    set({ _unsub: null })
  },

  aprovar: async (uid) => {
    await update(ref(rtdb, `/usuarios/${uid}`), { aprovado: true })
  },

  rejeitar: async (uid) => {
    await remove(ref(rtdb, `/usuarios/${uid}`))
  },
}))
