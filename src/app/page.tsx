'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileFAB } from '@/components/layout/mobile-fab'
import { Header } from '@/components/layout/header'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { GastosFijosView } from '@/components/dashboard/gastos-fijos-view'
import { GastosVariablesCard } from '@/components/dashboard/gastos-variables-card'
import { IngresosView } from '@/components/dashboard/ingresos-view'
import { ReportesView } from '@/components/dashboard/reportes-view'
import { MobileHome } from '@/components/dashboard/mobile-home'
import { ChatView } from '@/components/chat/chat-view'
import { AjustesView } from '@/components/ajustes/ajustes-view'
import { GastoDialog } from '@/components/forms/gasto-dialog'
import { IngresoDialog } from '@/components/forms/ingreso-dialog'
import { CommandPalette } from '@/components/shared/command-palette'
import { AuthView, LogoutButton } from '@/components/auth/auth-view'
import { useAppStore } from '@/store/app'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useDashboard, useSessionActiva, useUsuarioActual } from '@/hooks/use-data'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Snowflake, PiggyBank, UserCircle, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { PanelDerecho } from '@/components/dashboard/panel-derecho'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function DeudasView() {
  const { data, isLoading } = useDashboard()
  const deudas = (data?.gastosFijos || []).filter((g: any) => g.categoria === 'Deudas')
  const totalDeudas = deudas.reduce((s: number, g: any) => s + g.monto, 0)
  const pagado = deudas.filter((g: any) => g.estado === 'pagado').reduce((s: number, g: any) => s + g.monto, 0)

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-8 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-[#6366f1]" />
          </div>
          <div>
            <div className="text-2xl font-bold">Método Bola de Nieve</div>
            <div className="text-sm text-[#8b8b94]">
              Pagá primero las deudas más pequeñas para generar impulso
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-2xl p-5 bg-white/[0.03]">
            <div className="text-xs text-[#8b8b94] mb-2">Total deudas</div>
            <div className="text-2xl font-bold tabular">{isLoading ? '—' : formatCurrency(totalDeudas)}</div>
          </div>
          <div className="rounded-2xl p-5 bg-white/[0.03]">
            <div className="text-xs text-[#8b8b94] mb-2">Ya pagado</div>
            <div className="text-2xl font-bold tabular text-[#10b981]">{isLoading ? '—' : formatCurrency(pagado)}</div>
          </div>
          <div className="rounded-2xl p-5 bg-white/[0.03]">
            <div className="text-xs text-[#8b8b94] mb-2">Restante</div>
            <div className="text-2xl font-bold tabular text-[#f59e0b]">{isLoading ? '—' : formatCurrency(totalDeudas - pagado)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-6 glass">
        <div className="text-base font-semibold mb-4">Tus deudas (ordenadas por monto)</div>
        {isLoading ? (
          <Skeleton className="h-20 w-full shimmer" />
        ) : deudas.length === 0 ? (
          <div className="text-sm text-[#8b8b94] py-8 text-center">
            🎉 No tenés deudas registradas este mes
          </div>
        ) : (
          <div className="space-y-3">
            {[...deudas]
              .sort((a: any, b: any) => a.monto - b.monto)
              .map((d: any, i: number) => (
                <div
                  key={d.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{d.concepto}</div>
                    <div className="text-xs text-[#8b8b94]">Vence día {d.diaVencimiento}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tabular">{formatCurrency(d.monto)}</div>
                    <div className={`text-xs ${d.estado === 'pagado' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                      {d.estado === 'pagado' ? '✓ Pagado' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AhorrosView() {
  const { data, isLoading } = useDashboard()
  const metas = data?.metas || []

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-8 glass">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-[#10b981]" />
          </div>
          <div>
            <div className="text-2xl font-bold">Metas de Ahorro</div>
            <div className="text-sm text-[#8b8b94]">Progreso del mes en curso</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Skeleton className="h-40 rounded-3xl shimmer" />
          <Skeleton className="h-40 rounded-3xl shimmer" />
        </div>
      ) : metas.length === 0 ? (
        <div className="rounded-3xl p-12 glass text-center text-[#8b8b94]">
          No tenés metas de ahorro este mes. ¡Creá una desde Ajustes!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {metas.map((meta: any) => {
            const pct = Math.min((meta.montoActual / meta.montoObjetivo) * 100, 100)
            return (
              <div key={meta.id} className="rounded-3xl p-6 glass">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-bold">{meta.titulo}</div>
                    <div className="text-xs text-[#8b8b94]">
                      ${meta.montoActual.toLocaleString('es-AR')} de ${meta.montoObjetivo.toLocaleString('es-AR')}
                    </div>
                  </div>
                  <div className="text-2xl font-bold tabular text-[#10b981]">
                    {pct.toFixed(0)}%
                  </div>
                </div>
                <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399]"
                    style={{ width: `${pct}%`, boxShadow: '0 0 12px #10b981' }}
                  />
                </div>
                <div className="text-xs text-[#8b8b94]">
                  Te faltan <strong className="text-white">${(meta.montoObjetivo - meta.montoActual).toLocaleString('es-AR')}</strong> para alcanzar tu meta
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function GastosVariablesView() {
  const { data, isLoading } = useDashboard()
  const { abrirGastoDialog } = useAppStore()
  return (
    <div className="space-y-5">
      {/* Botón agregar */}
      <div className="flex justify-end">
        <button
          onClick={() => abrirGastoDialog('variable')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] text-white text-sm font-semibold border-none cursor-pointer flex items-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,158,11,0.6)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Gasto Diario
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <GastosVariablesCard
            gastos={data?.gastosVariables || []}
            total={data?.resumen.totalGastosVariables || 0}
            presupuesto={data?.resumen.presupuestoVariables || 0}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-3xl p-6 glass h-full">
            <div className="text-base font-semibold mb-4">Resumen por categoría</div>
            {isLoading ? (
              <Skeleton className="h-40 w-full shimmer" />
            ) : (data?.gastosVariables || []).length === 0 ? (
              <div className="text-sm text-[#8b8b94] py-8 text-center">
                Sin gastos este mes
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  (data?.gastosVariables || []).reduce((acc: any, g: any) => {
                    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
                    return acc
                  }, {})
                )
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([cat, monto]: any) => {
                    const total = data?.resumen.totalGastosVariables || 1
                    const pct = ((monto / total) * 100).toFixed(0)
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat}</span>
                          <span className="tabular font-semibold">${monto.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UsuarioSwitcher() {
  const { data: usuarioActualData } = useUsuarioActual()
  const { usuarioActivoNombre, usuarioActivoColor } = useAppStore()
  const emailVerificado = usuarioActualData?.usuario?.emailVerificado
  const email = usuarioActualData?.usuario?.email
  const username = usuarioActualData?.usuario?.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass hover:bg-white/[0.08] cursor-pointer transition-all">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: `${usuarioActivoColor}25`, color: usuarioActivoColor }}
          >
            {usuarioActivoNombre.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{usuarioActivoNombre}</span>
          {emailVerificado === false && (
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" title="Email sin verificar" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong border-white/10 min-w-[220px]">
        <div className="px-3 py-2 border-b border-white/[0.08]">
          <div className="text-sm font-semibold">{usuarioActivoNombre}</div>
          <div className="text-xs text-[#8b8b94]">@{username || 'sin username'}</div>
          <div className="text-xs text-[#8b8b94]">{email}</div>
          {emailVerificado === false && (
            <div className="mt-2 px-2 py-1 rounded-md bg-[rgba(245,158,11,0.15)] text-[#f59e0b] text-[0.65rem] font-semibold">
              ⚠ Email sin verificar
            </div>
          )}
        </div>
        <div className="pt-2">
          <LogoutButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MainContent() {
  const { seccion } = useAppStore()

  return (
    <>
      {seccion === 'dashboard' && <DashboardView />}
      {seccion === 'ingresos' && <IngresosView />}
      {seccion === 'gastos-fijos' && <GastosFijosView />}
      {seccion === 'gastos-variables' && <GastosVariablesView />}
      {seccion === 'deudas' && <DeudasView />}
      {seccion === 'ahorros' && <AhorrosView />}
      {seccion === 'reportes' && <ReportesView />}
      {seccion === 'chat' && <ChatView />}
      {seccion === 'ajustes' && <AjustesView />}
    </>
  )
}

// Layout mobile estilo Mercado Pago
function MobileLayout() {
  const { seccion } = useAppStore()

  return (
    <div className="md:hidden min-h-screen">
      {/* Header mobile simplificado */}
      <header className="sticky top-0 z-30 px-4 py-3 glass-strong border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="font-bold text-sm">LiderControl</span>
          </div>
          <UsuarioSwitcher />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="px-4 py-4 pb-28">
        {/* En dashboard, usar MobileHome (estilo Mercado Pago) */}
        {seccion === 'dashboard' && <MobileHome />}
        {/* En otras secciones, mostrar el contenido normal */}
        {seccion !== 'dashboard' && <MainContent />}
      </main>

      {/* FAB para agregar rápido */}
      <MobileFAB />

      {/* Bottom navigation */}
      <MobileNav />
    </div>
  )
}

function AppShell() {
  const { gastoDialogOpen, ingresoDialogOpen, cmdkOpen, setCmdkOpen, setSeccion } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(gastoDialogOpen)
  const [ingresoOpen, setIngresoOpen] = useState(ingresoDialogOpen)
  const { autenticado, refetch } = useSessionActiva()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setDialogOpen(gastoDialogOpen)
  }, [gastoDialogOpen])

  useEffect(() => {
    setIngresoOpen(ingresoDialogOpen)
  }, [ingresoDialogOpen])

  // Detectar mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Sincronizar mes/año con la fecha real al montar
  useEffect(() => {
    const now = new Date()
    const mesActual = now.getMonth() + 1
    const anioActual = now.getFullYear()
    const { mes, anio, setMesAnio } = useAppStore.getState()
    // Solo sincronizar si el mes/año guardado es diferente al real
    if (mes !== mesActual || anio !== anioActual) {
      // Verificar si el mes guardado ya pasó (ej: guardado en junio, hoy es julio)
      // En ese caso, ir al mes actual automáticamente
      const fechaGuardada = new Date(anio, mes - 1)
      const fechaActual = new Date(anioActual, mesActual - 1)
      if (fechaGuardada < fechaActual) {
        setMesAnio(mesActual, anioActual)
      }
    }
  }, [autenticado])

  useKeyboardShortcuts()

  // Si no hay sesión, mostrar pantalla de login directamente (sin splash)
  if (!autenticado) {
    return (
      <AuthView
        onLoginExitoso={() => {
          // Forzar ir al dashboard y sincronizar con fecha real después del login
          setSeccion('dashboard')
          useAppStore.getState().initMesActual()
          refetch()
        }}
      />
    )
  }

  // Mobile layout (estilo Mercado Pago)
  if (isMobile) {
    return (
      <>
        <MobileLayout />
        <GastoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <IngresoDialog open={ingresoOpen} onOpenChange={setIngresoOpen} />
        <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} />
      </>
    )
  }

  // Desktop layout (3 columnas estilo Neo Finance)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Header onAbrirCmdk={() => setCmdkOpen(true)} />
          <MainContent />
        </main>
      </div>
      <PanelDerecho />

      <GastoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <IngresoDialog open={ingresoOpen} onOpenChange={setIngresoOpen} />
      <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} />
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  )
}
