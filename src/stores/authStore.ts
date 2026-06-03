import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { ref, get as fbGet, set as fbSet } from 'firebase/database'
import { auth, rtdb } from '@/lib/firebase'
import { getCurrentDateISO } from '@/lib/utils'
import type { Usuario, EquipeKey } from '@/types'

interface AuthState {
  firebaseUser: User | null
  userData: Usuario | null
  authLoading: boolean
  error: string | null

  init: () => () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (dados: {
    nome: string
    email: string
    password: string
    equipe: EquipeKey
  }) => Promise<void>
  clearError: () => void
}

async function fetchUserData(uid: string): Promise<Usuario | null> {
  const snap = await fbGet(ref(rtdb, `/usuarios/${uid}`))
  if (!snap.exists()) return null
  return { uid, ...snap.val() } as Usuario
}

async function seedAdminIfNeeded(): Promise<void> {
  const configRef = ref(rtdb, '/config/adminSeeded')
  const snap = await fbGet(configRef)
  if (snap.exists() && snap.val() === true) return

  try {
    const cred = await createUserWithEmailAndPassword(auth, 'admin@admin.com', 'maanaim123')
    await fbSet(ref(rtdb, `/usuarios/${cred.user.uid}`), {
      nome: 'Administrador',
      email: 'admin@admin.com',
      equipe: 'ADMIN',
      role: 'admin',
      aprovado: true,
      createdAt: getCurrentDateISO(),
    })
    await fbSet(configRef, true)
    await firebaseSignOut(auth)
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'auth/email-already-in-use') {
      await fbSet(configRef, true)
    }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userData: null,
  authLoading: true,
  error: null,

  init: () => {
    seedAdminIfNeeded()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ firebaseUser: null, userData: null, authLoading: false })
        return
      }
      const userData = await fetchUserData(user.uid)
      set({ firebaseUser: user, userData, authLoading: false })
    })

    return unsubscribe
  },

  login: async (email, password) => {
    set({ error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      const err = e as { code?: string }
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      }
      set({ error: messages[err.code ?? ''] ?? 'Erro ao fazer login.' })
      throw e
    }
  },

  logout: async () => {
    await firebaseSignOut(auth)
    set({ firebaseUser: null, userData: null })
  },

  register: async ({ nome, email, password, equipe }) => {
    set({ error: null })
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await fbSet(ref(rtdb, `/usuarios/${cred.user.uid}`), {
        nome,
        email,
        equipe,
        role: 'membro',
        aprovado: false,
        createdAt: getCurrentDateISO(),
      })
    } catch (e: unknown) {
      const err = e as { code?: string }
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já está em uso.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
        'auth/invalid-email': 'E-mail inválido.',
      }
      set({ error: messages[err.code ?? ''] ?? 'Erro ao cadastrar.' })
      throw e
    }
  },

  clearError: () => set({ error: null }),
}))
