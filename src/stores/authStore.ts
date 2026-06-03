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

  try {
    const snap = await fbGet(configRef)
    if (snap.exists() && snap.val() === true) return
  } catch {
    // Sem permissão para ler a config — prossegue e tenta criar o admin mesmo assim
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, 'admin@admin.com', 'maanaim123')
    try {
      await fbSet(ref(rtdb, `/usuarios/${cred.user.uid}`), {
        nome: 'Administrador',
        email: 'admin@admin.com',
        equipe: 'ADMIN',
        role: 'admin',
        aprovado: true,
        createdAt: getCurrentDateISO(),
      })
      await fbSet(configRef, true)
    } catch {
      // Escrita no RTDB negada — usuário foi criado no Auth mas sem registro no banco
    }
    await firebaseSignOut(auth)
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'auth/email-already-in-use') {
      try {
        await fbSet(configRef, true)
      } catch {
        // Sem permissão para marcar config — ignora
      }
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
      let userData = await fetchUserData(user.uid)

      // Se o admin fez login mas não tem registro no RTDB, cria automaticamente
      if (!userData && user.email === 'admin@admin.com') {
        try {
          await fbSet(ref(rtdb, `/usuarios/${user.uid}`), {
            nome: 'Administrador',
            email: 'admin@admin.com',
            equipe: 'ADMIN',
            role: 'admin',
            aprovado: true,
            createdAt: getCurrentDateISO(),
          })
          userData = await fetchUserData(user.uid)
        } catch {
          // ignora se o RTDB ainda não permitir
        }
      }

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
        'auth/operation-not-allowed': 'Login por e-mail não está habilitado no Firebase. Ative em Authentication → Sign-in method.',
        'auth/invalid-email': 'E-mail inválido.',
      }
      console.error('[Auth] Código do erro Firebase:', err.code, e)
      set({ error: messages[err.code ?? ''] ?? `Erro ao fazer login. (${err.code ?? 'desconhecido'})` })
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
