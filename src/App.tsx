import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import { useInitialLoad } from '@/hooks/useInitialLoad'
import { useAuthStore } from '@/stores/authStore'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { CadastroPage } from '@/pages/auth/CadastroPage'
import { AguardandoPage } from '@/pages/auth/AguardandoPage'

// Admin layout + pages
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AlmoxarifadoPage } from '@/pages/almoxarifado/AlmoxarifadoPage'
import { LimpezaPage } from '@/pages/limpeza/LimpezaPage'
import { AcontecimentosPage } from '@/pages/acontecimentos/AcontecimentosPage'
import { RelatoriosPage } from '@/pages/relatorios/RelatoriosPage'
import { UsuariosPage } from '@/pages/admin/UsuariosPage'

// Equipe layout + pages
import { EquipeLayout } from '@/components/layout/EquipeLayout'
import { EquipeAcontecimentosPage } from '@/pages/equipe/EquipeAcontecimentosPage'
import { BombeirosPage } from '@/pages/equipe/BombeirosPage'

// ─── Splash de loading ────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Roteamento principal ─────────────────────────────────────────────────────

function AppRoutes() {
  useInitialLoad()

  const authLoading = useAuthStore((s) => s.authLoading)
  const firebaseUser = useAuthStore((s) => s.firebaseUser)
  const userData = useAuthStore((s) => s.userData)

  if (authLoading) return <SplashScreen />

  // Não autenticado
  if (!firebaseUser) {
    return (
      <Routes>
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  // Autenticado mas aguardando aprovação
  if (!userData?.aprovado) {
    return (
      <Routes>
        <Route path="*" element={<AguardandoPage />} />
      </Routes>
    )
  }

  // Admin
  if (userData.role === 'admin') {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/almoxarifado" element={<AlmoxarifadoPage />} />
          <Route path="/admin/limpeza" element={<LimpezaPage />} />
          <Route path="/admin/acontecimentos" element={<AcontecimentosPage />} />
          <Route path="/admin/relatorios" element={<RelatoriosPage />} />
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  // Membro de equipe — página especial para Bombeiros
  const isBombeiros = userData.equipe === 'BOMBEIROS'

  return (
    <Routes>
      <Route element={<EquipeLayout />}>
        <Route
          path="/equipe"
          element={isBombeiros ? <BombeirosPage /> : <EquipeAcontecimentosPage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/equipe" replace />} />
    </Routes>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#e2e8f0',
          },
        }}
      />
    </HashRouter>
  )
}
