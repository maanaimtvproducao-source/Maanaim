import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Sparkles,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    to: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
    end: true,
  },
  {
    to: '/almoxarifado',
    icon: Package,
    label: 'Almoxarifado',
  },
  {
    to: '/limpeza',
    icon: Sparkles,
    label: 'Limpeza',
  },
  {
    to: '/acontecimentos',
    icon: CalendarDays,
    label: 'Acontecimentos',
  },
  {
    to: '/relatorios',
    icon: BarChart3,
    label: 'Relatórios',
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-surface-700 shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600">
          <span className="text-white font-bold text-base">M</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-surface-50 leading-tight truncate">Maanaim</p>
            <p className="text-xs text-surface-500 truncate">Controle de Estoque</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-surface-400 hover:bg-surface-700 hover:text-surface-100',
                collapsed && 'justify-center px-2'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle button (desktop) */}
      <div className="hidden md:flex p-3 border-t border-surface-700">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-surface-500 hover:bg-surface-700 hover:text-surface-200 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 h-screen bg-surface-850 border-r border-surface-700',
          'transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-850 border-r border-surface-700 z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg text-surface-400 hover:bg-surface-700 hover:text-surface-100 transition-colors"
    >
      <Menu size={20} />
    </button>
  )
}
