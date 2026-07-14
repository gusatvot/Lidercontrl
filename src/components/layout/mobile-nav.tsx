'use client'

import { useAppStore, type Seccion } from '@/store/app'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TrendingUp,
  Home,
  ChartColumn,
  MessageSquare,
  Settings,
  MoreHorizontal,
  Snowflake,
  PiggyBank,
  ShoppingCart,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS: { id: Seccion; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'ingresos', label: 'Ingresos', icon: TrendingUp },
  { id: 'gastos-fijos', label: 'Gastos', icon: Home },
  { id: 'reportes', label: 'Reportes', icon: ChartColumn },
  // Chat desactivado: ver nota en sidebar.tsx
  // { id: 'chat', label: 'Chat', icon: MessageSquare },
]

const MORE_ITEMS: { id: Seccion; label: string; icon: any }[] = [
  { id: 'gastos-variables', label: 'Gastos Diarios', icon: ShoppingCart },
  { id: 'deudas', label: 'Pago Deudas', icon: Snowflake },
  { id: 'ahorros', label: 'Ahorros', icon: PiggyBank },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

export function MobileNav() {
  const { seccion, setSeccion } = useAppStore()
  const [moreOpen, setMoreOpen] = useState(false)

  // Si la sección actual está en MORE_ITEMS, mostrar "Más" como activo
  const moreActive = MORE_ITEMS.some((item) => item.id === seccion)

  const handleNavClick = (id: Seccion) => {
    setSeccion(id)
    setMoreOpen(false)
  }

  return (
    <>
      {/* Overlay cuando el menú "Más" está abierto */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Panel "Más" que sube desde abajo */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong rounded-t-3xl border-t border-[var(--border)] pb-2"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <span className="text-sm font-semibold">Más opciones</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--secondary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon
                const active = seccion === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all',
                      active
                        ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)]'
                        : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation principal */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="glass-strong border-t border-[var(--border)] backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />

          <div className="flex items-center justify-around px-1 py-2 safe-area-pb">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = seccion === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer min-w-[48px]',
                    active ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                  )}
                >
                  <Icon
                    className={cn('w-5 h-5 transition-transform', active && 'scale-110')}
                    fill={active ? 'currentColor' : 'none'}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={cn('text-[0.6rem] font-medium', active && 'font-semibold')}>
                    {item.label}
                  </span>
                </button>
              )
            })}

            {/* Botón "Más" */}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer min-w-[48px]',
                moreActive || moreOpen ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
              )}
            >
              <MoreHorizontal
                className={cn('w-5 h-5 transition-transform', moreOpen && 'scale-110')}
                fill={moreOpen ? 'currentColor' : 'none'}
                strokeWidth={moreOpen ? 2.5 : 2}
              />
              <span className={cn('text-[0.6rem] font-medium', (moreActive || moreOpen) && 'font-semibold')}>
                Más
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
