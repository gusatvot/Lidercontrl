'use client'

import { useDashboard } from '@/hooks/use-data'
import { useAppStore } from '@/store/app'
import { motion } from 'framer-motion'
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Plus, Wallet, ChartColumn, PiggyBank, Bell, ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { MESES } from '@/lib/types'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

export function MobileHome() {
  const { data, isLoading } = useDashboard()
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const { setSeccion, abrirGastoDialog, abrirIngresoDialog, mes, anio } = useAppStore()
  // Suscribirse al formato para re-renderizar cuando cambie
  const formatoMoneda = useAppStore((s) => s.apariencia.formatoMoneda)
  const resumen = data?.resumen

  if (isLoading || !resumen) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-40 rounded-3xl shimmer" />
        <Skeleton className="h-24 rounded-3xl shimmer" />
        <Skeleton className="h-24 rounded-3xl shimmer" />
      </div>
    )
  }

  const quickActions = [
    {
      label: 'Gasto',
      sublabel: 'Diario',
      icon: Plus,
      color: '#f59e0b',
      onClick: () => abrirGastoDialog('variable'),
    },
    {
      label: 'Ingreso',
      sublabel: 'Nuevo',
      icon: TrendingUp,
      color: '#10b981',
      onClick: () => abrirIngresoDialog(),
    },
    {
      label: 'Reportes',
      sublabel: 'Ver',
      icon: ChartColumn,
      color: '#6366f1',
      onClick: () => setSeccion('reportes'),
    },
    {
      label: 'Ahorros',
      sublabel: 'Metas',
      icon: PiggyBank,
      color: '#8b5cf6',
      onClick: () => setSeccion('ahorros'),
    },
  ]

  // Últimos movimientos
  const movimientos = [
    ...(data?.ingresos || []).map((i: any) => ({
      id: i.id,
      concepto: i.concepto,
      categoria: i.categoria,
      monto: i.monto,
      tipo: 'ingreso' as const,
      fecha: i.fecha,
    })),
    ...(data?.gastosVariables || []).map((g: any) => ({
      id: g.id,
      concepto: g.concepto,
      categoria: g.categoria,
      monto: -g.monto,
      tipo: 'gasto' as const,
      fecha: g.fecha,
    })),
    ...(data?.gastosFijos || []).map((g: any) => ({
      id: g.id,
      concepto: g.concepto,
      categoria: g.categoria,
      monto: -g.monto,
      tipo: 'gasto' as const,
      fecha: new Date(anio, mes - 1, g.diaVencimiento),
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)

  return (
    <div className="space-y-4 pb-24">
      {/* Hero card: saldo principal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] relative overflow-hidden shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
      >
        {/* Glow decorativo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--foreground)]/80 font-medium">Saldo disponible</span>
            <Bell className="w-4 h-4 text-[var(--foreground)]/60" />
          </div>
          <div className="text-3xl font-bold text-[var(--foreground)] tabular mb-3">
            {fc(resumen.saldo - resumen.totalGastosFijos - resumen.totalGastosVariables)}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/15">
              <ArrowUpRight className="w-3 h-3 text-[#86efac]" />
              <span className="text-[var(--foreground)]">{fc(resumen.ingresoTotal)}</span>
              <span className="text-[var(--foreground)]/60">ingresos</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/15">
              <ArrowDownRight className="w-3 h-3 text-[#fca5a5]" />
              <span className="text-[var(--foreground)]">{fc(resumen.totalGastosFijos + resumen.totalGastosVariables)}</span>
              <span className="text-[var(--foreground)]/60">gastos</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick actions grid (4 acciones) */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action, i) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl glass cursor-pointer hover:bg-[var(--secondary)] transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${action.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: action.color }} strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold">{action.label}</div>
                <div className="text-[0.6rem] text-[var(--muted-foreground)]">{action.sublabel}</div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Resumen del mes */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setSeccion('ingresos')}
          className="p-4 rounded-2xl glass text-left cursor-pointer hover:bg-[var(--secondary)] transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--chart-3)]" />
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">Ingresos del mes</span>
          </div>
          <div className="text-xl font-bold tabular text-[var(--chart-3)]">
            +{fc(resumen.ingresoTotal)}
          </div>
          <div className="text-[0.65rem] text-[var(--muted-foreground)] mt-1">
            +{fc(resumen.totalIngresosExtras)} extras
          </div>
        </button>

        <button
          onClick={() => setSeccion('gastos-fijos')}
          className="p-4 rounded-2xl glass text-left cursor-pointer hover:bg-[var(--secondary)] transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[rgba(244,63,94,0.15)] flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-[var(--destructive)]" />
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">Gastos del mes</span>
          </div>
          <div className="text-xl font-bold tabular text-[var(--destructive)]">
            −{fc(resumen.totalGastosFijos + resumen.totalGastosVariables)}
          </div>
          <div className="text-[0.65rem] text-[var(--muted-foreground)] mt-1">
            {fc(resumen.totalGastosVariables)} diarios
          </div>
        </button>
      </div>

      {/* Ahorro proyectado */}
      <button
        onClick={() => setSeccion('ahorros')}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-[rgba(99,102,241,0.1)] to-[rgba(139,92,246,0.05)] border border-[rgba(99,102,241,0.2)] flex items-center gap-3 cursor-pointer hover:bg-[rgba(99,102,241,0.15)] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-[rgba(99,102,241,0.2)] flex items-center justify-center shrink-0">
          <PiggyBank className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs text-[var(--muted-foreground)]">Ahorro proyectado</div>
          <div className="text-lg font-bold tabular text-[var(--primary)]">
            +{fc(resumen.ingresoTotal - resumen.totalGastosFijos - resumen.totalGastosVariables)}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
      </button>

      {/* Últimos movimientos */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="text-sm font-semibold">Actividad reciente</span>
          <button
            onClick={() => setSeccion('reportes')}
            className="text-xs text-[var(--primary)] cursor-pointer font-medium"
          >
            Ver todo
          </button>
        </div>

        {movimientos.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            Sin movimientos este mes
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {movimientos.map((m: any, i: number) => {
              const esIngreso = m.monto > 0
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      esIngreso ? 'bg-[rgba(16,185,129,0.15)]' : 'bg-[rgba(244,63,94,0.15)]'
                    }`}
                  >
                    {esIngreso ? (
                      <ArrowUpRight className="w-4 h-4 text-[var(--chart-3)]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-[var(--destructive)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.concepto}</div>
                    <div className="text-[0.7rem] text-[var(--muted-foreground)]">{m.categoria}</div>
                  </div>
                  <div
                    className={`text-sm font-bold tabular shrink-0 ${
                      esIngreso ? 'text-[var(--chart-3)]' : 'text-[var(--destructive)]'
                    }`}
                  >
                    {esIngreso ? '+' : '−'}{fc(Math.abs(m.monto))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Label mes */}
      <div className="text-center text-xs text-[var(--muted-foreground)] pt-2">
        {MESES[mes - 1]} {anio} · LiderControl
      </div>
    </div>
  )
}
