import { useState, useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Sparkles,
  CalendarDays,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { APP_VERSION } from '@/version'
import { useProdutosStore } from '@/stores/produtosStore'
import { useUsuariosStore } from '@/stores/usuariosStore'

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/almoxarifado', icon: Package, label: 'Almoxarifado' },
  { to: '/admin/limpeza', icon: Sparkles, label: 'Limpeza' },
  { to: '/admin/acontecimentos', icon: CalendarDays, label: 'Acontecimentos' },
  { to: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/almoxarifado': 'Almoxarifado',
  '/admin/limpeza': 'Estoque de Limpeza',
  '/admin/acontecimentos': 'Acontecimentos',
  '/admin/relatorios': 'Relatórios',
  '/admin/usuarios': 'Usuários',
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const userData = useAuthStore((s) => s.userData)
  const produtos = useProdutosStore((s) => s.produtos)
  const usuarios = useUsuariosStore((s) => s.usuarios)

  const abaixoMinimo = useMemo(
    () => produtos.filter((p) => p.quantidadeAtual <= p.quantidadeMinima).length,
    [produtos]
  )
  const pendentes = useMemo(
    () => usuarios.filter((u) => !u.aprovado && u.role !== 'admin').length,
    [usuarios]
  )

  const title = PAGE_TITLES[location.pathname] ?? 'Maanaim'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-surface-700 shrink-0',
        collapsed ? 'justify-center' : 'gap-3')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600">
          <span className="text-white font-bold text-base">M</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-surface-50 leading-tight truncate">Maanaim</p>
            <p className="text-xs text-surface-500 truncate">Administrador</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn('relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive ? 'bg-primary-600 text-white' : 'text-surface-400 hover:bg-surface-700 hover:text-surface-100',
                collapsed && 'justify-center px-2'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
            {/* Badge de pendentes em Usuários */}
            {label === 'Usuários' && pendentes > 0 && (
              <span className={cn('ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black',
                collapsed && 'absolute -top-1 -right-1')}>
                {pendentes}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usuário + logout */}
      <div className={cn('p-3 border-t border-surface-700 space-y-2')}>
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-surface-700">
            <p className="text-xs font-medium text-surface-200 truncate">{userData?.nome}</p>
            <p className="text-xs text-surface-500 truncate">{userData?.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn('flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-surface-400 hover:bg-red-900/40 hover:text-red-300 transition-colors',
            collapsed && 'justify-center')}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn('hidden md:flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-surface-500 hover:bg-surface-700 hover:text-surface-200 transition-colors',
            collapsed && 'justify-center')}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Recolher</span>}
        </button>
        <p className={cn('text-[10px] text-surface-600 text-center select-none', collapsed && 'hidden')}>
          v{APP_VERSION}
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      {/* Sidebar desktop */}
      <aside className={cn('hidden md:flex flex-col shrink-0 h-screen bg-surface-850 border-r border-surface-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60')}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-850 border-r border-surface-700 z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center h-16 px-4 sm:px-6 border-b border-surface-700 bg-surface-850 shrink-0 gap-3">
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-surface-400 hover:bg-surface-700 transition-colors">
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-surface-100 text-lg flex-1">{title}</h1>
          {abaixoMinimo > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-900/40 border border-amber-800/50 text-amber-300 text-xs font-medium">
              <Bell size={13} />
              <span>{abaixoMinimo} estoque baixo</span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
