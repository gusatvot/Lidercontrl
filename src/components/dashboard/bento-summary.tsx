'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, PiggyBank, Wallet, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useAppStore } from '@/store/app'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'
import { Skeleton } from '@/components/ui/skeleton'

interface BentoSummaryProps {
  resumen?: {
    ingresoMensual: number
    ingresoTotal: number
    totalIngresosFijos: number
    totalIngresosExtras: number
    totalGastosFijos: number
    totalGastosFijosPagados: number
    totalGastosVariables: number
    presupuestoVariables: number
    metaAhorroMensual: number
    totalAhorros: number
    saldo: number
  }
  isLoading?: boolean
}

export function BentoSummary({ resumen, isLoading }: BentoSummaryProps) {
  // Obtener el formato del store (forza re-render cuando cambia)
  const formato = useFormatoMoneda()
  // Crear función con el formato bindiado
  const fc = (amount: number) => formatCurrency(amount, formato)

  if (isLoading || !resumen) {
    return (
      <div className="grid grid-cols-12 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-3xl p-6 glass">
            <Skeleton className="h-4 w-24 mb-3 shimmer" />
            <Skeleton className="h-8 w-32 mb-2 shimmer" />
            <Skeleton className="h-3 w-20 shimmer" />
          </div>
        ))}
      </div>
    )
  }

  const porcentajePagado = resumen.totalGastosFijos > 0
    ? Math.round((resumen.totalGastosFijosPagados / resumen.totalGastosFijos) * 100)
    : 0

  const porcentajeAhorro = resumen.metaAhorroMensual > 0
    ? Math.round((resumen.totalAhorros / resumen.metaAhorroMensual) * 100)
    : 0

  const porcentajeVariables = resumen.presupuestoVariables > 0
    ? Math.round((resumen.totalGastosVariables / resumen.presupuestoVariables) * 100)
    : 0

  const cards = [
    {
      label: 'Ingresos',
      value: resumen.ingresoTotal,
      trend: `+${fc(resumen.totalIngresosExtras)} extras`,
      trendType: 'up' as const,
      icon: Wallet,
      glow: '#10b981',
      variant: 'income',
    },
    {
      label: 'Gastos',
      value: resumen.totalGastosFijos + resumen.totalGastosVariables,
      trend: `Fijos: ${fc(resumen.totalGastosFijos)}`,
      trendType: 'down' as const,
      icon: AlertCircle,
      glow: '#f43f5e',
      variant: 'expense',
    },
    {
      label: 'Ahorros',
      value: resumen.totalAhorros,
      trend: `Meta: ${fc(resumen.metaAhorroMensual)}`,
      trendType: 'up' as const,
      icon: PiggyBank,
      glow: '#6366f1',
      variant: 'savings',
    },
    {
      label: 'Saldo',
      value: resumen.saldo - resumen.totalGastosFijos - resumen.totalGastosVariables,
      trend: 'Disponible',
      trendType: (resumen.saldo - resumen.totalGastosFijos - resumen.totalGastosVariables) >= 0 ? 'up' as const : 'down' as const,
      icon: TrendingUp,
      glow: '#f59e0b',
      variant: 'variables',
    },
  ]

  return (
    <div className="grid grid-cols-12 gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-3xl p-6 glass relative overflow-hidden group hover:border-white/20 transition-all cursor-default"
            style={{ ['--glow' as any]: card.glow }}
          >
            {/* Glow blob */}
            <div
              className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl"
              style={{ background: card.glow }}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: card.glow, boxShadow: `0 0 8px ${card.glow}` }}
                />
                {card.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${card.glow}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: card.glow }} />
              </div>
            </div>

            <div className="text-[1.8rem] font-bold tracking-tight tabular relative z-10">
              {fc(card.value)}
            </div>

            <div
              className={`text-xs font-medium mt-2 flex items-center gap-1 relative z-10 ${
                card.trendType === 'up' ? 'text-[var(--chart-3)]' : 'text-[var(--destructive)]'
              }`}
            >
              {card.trendType === 'up' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {card.trend}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
