import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useProdutosStore } from '@/stores/produtosStore'
import { useMovimentacoesStore } from '@/stores/movimentacoesStore'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { useParticipacaoStore } from '@/stores/participacoesStore'
import { useUsuariosStore } from '@/stores/usuariosStore'

export function useInitialLoad() {
  const authLoading = useAuthStore((s) => s.authLoading)
  const userData = useAuthStore((s) => s.userData)
  const initAuth = useAuthStore((s) => s.init)

  const initProdutos = useProdutosStore((s) => s.init)
  const initMovimentacoes = useMovimentacoesStore((s) => s.init)
  const initAcontecimentos = useAcontecimentosStore((s) => s.init)
  const initParticipacoes = useParticipacaoStore((s) => s.init)
  const initUsuarios = useUsuariosStore((s) => s.init)

  const destroyProdutos = useProdutosStore((s) => s.destroy)
  const destroyMovimentacoes = useMovimentacoesStore((s) => s.destroy)
  const destroyAcontecimentos = useAcontecimentosStore((s) => s.destroy)
  const destroyParticipacoes = useParticipacaoStore((s) => s.destroy)
  const destroyUsuarios = useUsuariosStore((s) => s.destroy)

  // Inicializa o listener de auth na montagem
  useEffect(() => {
    const unsubAuth = initAuth()
    return () => {
      unsubAuth()
    }
  }, [initAuth])

  // Quando o usuário está autenticado e aprovado, liga os listeners do Firebase
  useEffect(() => {
    if (!userData?.aprovado) return

    initProdutos()
    initMovimentacoes()
    initAcontecimentos()
    initParticipacoes()
    if (userData.role === 'admin') initUsuarios()

    return () => {
      destroyProdutos()
      destroyMovimentacoes()
      destroyAcontecimentos()
      destroyParticipacoes()
      destroyUsuarios()
    }
  }, [
    userData?.aprovado,
    userData?.role,
    initProdutos,
    initMovimentacoes,
    initAcontecimentos,
    initParticipacoes,
    initUsuarios,
    destroyProdutos,
    destroyMovimentacoes,
    destroyAcontecimentos,
    destroyParticipacoes,
    destroyUsuarios,
  ])

  return { authLoading }
}
