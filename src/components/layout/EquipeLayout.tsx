import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { EQUIPES, type EquipeKey } from '@/types'
import { APP_VERSION } from '@/version'

const NAV_ITEMS = [
  { to: '/equipe', icon: CalendarDays, label: 'Acontecimentos', end: true },
]

export function EquipeLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const userData = useAuthStore((s) => s.userData)
  const logout = useAuthStore((s) => s.logout)

  const equipeLabel =
    userData?.equipe && userData.equipe !== 'ADMIN'
      ? EQUIPES[userData.equipe as EquipeKey]
      : 'Equipe'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-surface-700 shrink-0 gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600">
          <span className="text-white font-bold text-base">M</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-surface-50 leading-tight truncate">Maanaim</p>
          <p className="text-xs text-primary-400 font-medium truncate">{equipeLabel}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive ? 'bg-primary-600 text-white' : 'text-surface-400 hover:bg-surface-700 hover:text-surface-100'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Usuário + logout */}
      <div className="p-3 border-t border-surface-700 space-y-2">
        <div className="px-3 py-2 rounded-lg bg-surface-700">
          <p className="text-xs font-medium text-surface-200 truncate">{userData?.nome}</p>
          <p className="text-xs text-surface-500 truncate">{userData?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-surface-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
        <p className="text-[10px] text-surface-600 text-center select-none">v{APP_VERSION}</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col shrink-0 h-screen w-60 bg-surface-850 border-r border-surface-700">
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
          <h1 className="font-semibold text-surface-100 text-lg flex-1">Acontecimentos</h1>
          <span className="text-xs text-primary-400 font-medium hidden sm:block">{equipeLabel}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
