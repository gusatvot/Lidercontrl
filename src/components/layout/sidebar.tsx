'use client'

import { useAppStore, type Seccion } from '@/store/app'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Home,
  ShoppingCart,
  Snowflake,
  PiggyBank,
  MessageSquare,
  Settings,
  Zap,
  TrendingUp,
  Wallet,
  BarChart3,
  Plus,
} from 'lucide-react'
import { LogoutButton } from '@/components/auth/auth-view'
import { useAppStore as useStore } from '@/store/app'

const NAV_ITEMS: { id: Seccion; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ingresos', label: 'Ingresos', icon: TrendingUp },
  { id: 'gastos-fijos', label: 'Gastos Fijos', icon: Home },
  { id: 'gastos-variables', label: 'Gastos Diarios', icon: ShoppingCart },
  { id: 'deudas', label: 'Deudas', icon: Snowflake },
  { id: 'ahorros', label: 'Ahorros', icon: PiggyBank },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

export function Sidebar() {
  const { seccion, setSeccion, abrirGastoDialog, usuarioActivoNombre, usuarioActivoColor } = useAppStore()

  return (
    <aside className="w-20 shrink-0 h-screen flex flex-col items-center py-4 border-r border-[var(--border)] bg-[var(--sidebar)]">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,255,163,0.3)]">
        <Wallet className="w-5 h-5 text-[var(--primary-foreground)]" />
      </div>

      {/* Perfil compacto */}
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4 border-2 transition-all hover:scale-110"
        style={{
          background: `${usuarioActivoColor}25`,
          color: usuarioActivoColor,
          borderColor: usuarioActivoColor,
        }}
        title={usuarioActivoNombre}
      >
        {usuarioActivoNombre.slice(0, 1).toUpperCase()}
      </button>

      {/* Navegación de iconos */}
      <nav className="flex-1 flex flex-col gap-2 items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = seccion === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSeccion(item.id)}
              title={item.label}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all',
                active
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </nav>

      {/* Botón + para agregar rápido */}
      <button
        onClick={() => abrirGastoDialog('variable')}
        className="w-11 h-11 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center cursor-pointer mb-3 shadow-[0_0_20px_rgba(0,255,163,0.4)] hover:scale-105 transition-all"
        title="Nuevo gasto"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Logout al final */}
      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  )
}