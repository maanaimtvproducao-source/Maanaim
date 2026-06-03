import { useState, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, MobileMenuButton } from './Sidebar'
import { Bell } from 'lucide-react'
import { useProdutosStore } from '@/stores/produtosStore'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/almoxarifado': 'Almoxarifado',
  '/limpeza': 'Estoque de Limpeza',
  '/acontecimentos': 'Acontecimentos',
  '/relatorios': 'Relatórios',
}

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const produtos = useProdutosStore((s) => s.produtos)
  const abaixoMinimo = useMemo(
    () => produtos.filter((p) => p.quantidadeAtual <= p.quantidadeMinima),
    [produtos]
  )

  const title = PAGE_TITLES[location.pathname] ?? 'Maanaim'

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center h-16 px-4 sm:px-6 border-b border-surface-700 bg-surface-850 shrink-0 gap-3">
          <MobileMenuButton onClick={() => setMobileOpen(true)} />
          <h1 className="font-semibold text-surface-100 text-lg flex-1">{title}</h1>

          {abaixoMinimo.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-900/40 border border-amber-800/50 text-amber-300 text-xs font-medium">
              <Bell size={13} />
              <span>{abaixoMinimo.length} item{abaixoMinimo.length > 1 ? 'ns' : ''} com estoque baixo</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
