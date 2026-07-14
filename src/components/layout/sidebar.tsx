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
  PanelLeftClose,
  PanelLeft,
  TrendingUp,
  X,
  BarChart3,
  ChevronDown,
  Wallet,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { LogoutButton } from '@/components/auth/auth-view'
import { motion, AnimatePresence } from 'framer-motion'

// Items antes del menú Gastos
const NAV_ITEMS_PRE: { id: Seccion; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ingresos', label: 'Ingresos', icon: TrendingUp },
]

// Items después del menú Gastos
// NOTA: Chat desactivado temporalmente hasta migrar Socket.io a hosting compatible.
// Para reactivar: descomentar la línea de chat abajo y restaurar useSocket() en page.tsx.
const NAV_ITEMS_POST: { id: Seccion; label: string; icon: any }[] = [
  { id: 'deudas', label: 'Pago Deudas', icon: Snowflake },
  { id: 'ahorros', label: 'Ahorros', icon: PiggyBank },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  // { id: 'chat', label: 'Chat', icon: MessageSquare },
]

// Sub-items de Gastos
const GASTOS_ITEMS: { id: Seccion; label: string; icon: any }[] = [
  { id: 'gastos-variables', label: 'Gastos Diarios', icon: ShoppingCart },
  { id: 'gastos-fijos', label: 'Gastos Fijos', icon: Home },
]

const FOOTER_ITEMS: { id: Seccion; label: string; icon: any }[] = [
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

// Componente del item de gastos expandible
function GastosExpandible({ collapsed }: { collapsed: boolean }) {
  const { seccion, setSeccion } = useAppStore()
  const [gastosOpen, setGastosOpen] = useState(false)

  // Si la sección actual es un sub-item de gastos, mantener abierto
  const algunGastoActivo = GASTOS_ITEMS.some((item) => item.id === seccion)

  // Auto-abrir si estamos en una sección de gastos
  useEffect(() => {
    if (algunGastoActivo) {
      Promise.resolve().then(() => setGastosOpen(true))
    }
  }, [algunGastoActivo])

  if (collapsed) {
    // Modo colapsado: mostrar solo icono, sin expandir
    return (
      <button
        onClick={() => setSeccion(GASTOS_ITEMS[0].id)}
        className={cn(
          'flex items-center justify-center p-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all w-full',
          algunGastoActivo
            ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
            : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
        )}
        title="Gastos"
      >
        <Wallet className="w-[18px] h-[18px] shrink-0" />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Botón principal "Gastos" */}
      <button
        onClick={() => setGastosOpen(!gastosOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
          algunGastoActivo
            ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
            : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
        )}
      >
        <Wallet className="w-[18px] h-[18px] shrink-0" />
        <span className="flex-1 text-left">Gastos</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform shrink-0',
            gastosOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Sub-items desplegables */}
      <AnimatePresence>
        {gastosOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 pl-4 mt-1">
              {GASTOS_ITEMS.map((item) => {
                const Icon = item.icon
                const active = seccion === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setSeccion(item.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-[0.85rem] font-medium cursor-pointer transition-all',
                      active
                        ? 'bg-gradient-to-br from-[rgba(99,102,241,0.15)] to-[rgba(139,92,246,0.08)] text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar() {
  const { seccion, setSeccion } = useAppStore()
  const [expandido, setExpandido] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleNavClick = (id: Seccion) => {
    setSeccion(id)
    if (isMobile) setMobileOpen(false)
  }

  // === MOBILE: Drawer con overlay ===
  if (isMobile) {
    return (
      <>
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass-strong border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--secondary)] transition-all md:hidden"
            aria-label="Abrir menú"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r border-[var(--border)] backdrop-blur-xl bg-[var(--sidebar)] w-[280px] transition-transform duration-300 md:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center gap-[10px] px-3 py-6 font-bold text-[1.2rem] tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0">
              <Zap className="w-4 h-4 text-[var(--foreground)]" fill="white" />
            </div>
            <span className="flex-1">LiderControl</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
            {/* Items antes de Gastos */}
            {NAV_ITEMS_PRE.map((item) => {
              const Icon = item.icon
              const active = seccion === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                    active
                      ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}

            {/* Gastos expandible */}
            <GastosExpandible collapsed={false} />

            {/* Items después de Gastos */}
            {NAV_ITEMS_POST.map((item) => {
              const Icon = item.icon
              const active = seccion === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                    active
                      ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="px-3 pb-3 flex flex-col gap-1">
            {FOOTER_ITEMS.map((item) => {
              const Icon = item.icon
              const active = seccion === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                    active
                      ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            <LogoutButton />
          </div>
        </aside>
      </>
    )
  }

  // === DESKTOP: Colapsado (72px) ===
  if (!expandido) {
    return (
      <aside className="flex flex-col border-r border-[var(--border)] backdrop-blur-xl bg-[var(--sidebar)] z-10 transition-all duration-300 shrink-0 w-[72px]">
        <div className="flex justify-center py-4">
          <button
            onClick={() => setExpandido(true)}
            className="w-10 h-10 rounded-xl glass-strong border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--secondary)] transition-all"
            aria-label="Expandir barra lateral"
            title="Expandir barra lateral"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS_PRE.map((item) => {
            const Icon = item.icon
            const active = seccion === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex items-center justify-center p-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                  active
                    ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                )}
                title={item.label}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
              </button>
            )
          })}
          {/* Gastos en modo colapsado */}
          <GastosExpandible collapsed />
          {NAV_ITEMS_POST.map((item) => {
            const Icon = item.icon
            const active = seccion === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex items-center justify-center p-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                  active
                    ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                )}
                title={item.label}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
              </button>
            )
          })}
        </nav>

        <div className="px-2 pb-3 flex flex-col gap-1">
          {FOOTER_ITEMS.map((item) => {
            const Icon = item.icon
            const active = seccion === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex items-center justify-center p-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                  active
                    ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                )}
                title={item.label}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
              </button>
            )
          })}
          <LogoutButton collapsed />
        </div>
      </aside>
    )
  }

  // === DESKTOP: Expandido (260px) ===
  return (
    <aside className="flex flex-col border-r border-[var(--border)] backdrop-blur-xl bg-[var(--sidebar)] z-10 transition-all duration-300 shrink-0 w-[260px]">
      <div className="flex items-center gap-[10px] px-3 py-6 font-bold text-[1.2rem] tracking-tight">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0">
          <Zap className="w-4 h-4 text-[var(--foreground)]" fill="white" />
        </div>
        <span className="flex-1">LiderControl</span>
        <button
          onClick={() => setExpandido(false)}
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
          aria-label="Colapsar barra lateral"
          title="Colapsar barra lateral"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {/* Items antes de Gastos */}
        {NAV_ITEMS_PRE.map((item) => {
          const Icon = item.icon
          const active = seccion === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                active
                  ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}

        {/* Gastos expandible */}
        <GastosExpandible collapsed={false} />

        {/* Items después de Gastos */}
        {NAV_ITEMS_POST.map((item) => {
          const Icon = item.icon
          const active = seccion === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                active
                  ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-3 pb-3 flex flex-col gap-1">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon
          const active = seccion === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] font-medium cursor-pointer transition-all',
                active
                  ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
        <LogoutButton />
      </div>
    </aside>
  )
}
