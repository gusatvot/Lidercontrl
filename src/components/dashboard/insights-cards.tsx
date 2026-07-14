'use client'

import { useDashboard, useTendencias } from '@/hooks/use-data'
import { formatCurrency } from '@/lib/format'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, AlertTriangle, PiggyBank, Calendar, Target, Lightbulb,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

export function InsightsCards() {
  const { data: dashboard, isLoading: loadingDash } = useDashboard()
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const { data: tendencias, isLoading: loadingTend } = useTendencias()

  if (loadingDash || loadingTend) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl shimmer" />
        ))}
      </div>
    )
  }

  const insights: {
    icon: any
    color: string
    bg: string
    titulo: string
    detalle: string
    tipo: 'positivo' | 'negativo' | 'neutral' | 'alerta'
  }[] = []

  const resumen = dashboard?.resumen
  const meses = tendencias?.meses || []

  // 1. Comparativa con mes anterior
  if (meses.length >= 2) {
    const mesActual = meses[meses.length - 1]
    const mesAnterior = meses[meses.length - 2]

    if (mesAnterior.gastos > 0) {
      const diff = mesActual.gastos - mesAnterior.gastos
      const pct = Math.round((diff / mesAnterior.gastos) * 100)
      if (pct > 0) {
        insights.push({
          icon: TrendingUp,
          color: '#f43f5e',
          bg: 'rgba(244,63,94,0.1)',
          titulo: `Gastaste ${pct}% más que el mes pasado`,
          detalle: `De ${fc(mesAnterior.gastos)} a ${fc(mesActual.gastos)}`,
          tipo: 'negativo',
        })
      } else if (pct < 0) {
        insights.push({
          icon: TrendingDown,
          color: '#10b981',
          bg: 'rgba(16,185,129,0.1)',
          titulo: `Gastaste ${Math.abs(pct)}% menos que el mes pasado`,
          detalle: `De ${fc(mesAnterior.gastos)} a ${fc(mesActual.gastos)}`,
          tipo: 'positivo',
        })
      }
    }
  }

  // 2. Exceso de presupuesto en variables
  if (resumen && resumen.presupuestoVariables > 0) {
    const pct = (resumen.totalGastosVariables / resumen.presupuestoVariables) * 100
    if (pct > 100) {
      insights.push({
        icon: AlertTriangle,
        color: '#f43f5e',
        bg: 'rgba(244,63,94,0.1)',
        titulo: 'Excediste el presupuesto de gastos variables',
        detalle: `Llevás ${fc(resumen.totalGastosVariables)} de ${fc(resumen.presupuestoVariables)} (${pct.toFixed(0)}%)`,
        tipo: 'alerta',
      })
    } else if (pct > 80) {
      insights.push({
        icon: AlertTriangle,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.1)',
        titulo: 'Cerca del límite en gastos variables',
        detalle: `Usaste ${pct.toFixed(0)}% del presupuesto. Quedan ${fc(resumen.presupuestoVariables - resumen.totalGastosVariables)}`,
        tipo: 'alerta',
      })
    }
  }

  // 3. Próximo vencimiento
  const gastosPendientes = (dashboard?.gastosFijos || [])
    .filter((g: any) => g.estado === 'pendiente')
    .sort((a: any, b: any) => a.diaVencimiento - b.diaVencimiento)
  if (gastosPendientes.length > 0) {
    const proximo = gastosPendientes[0]
    insights.push({
      icon: Calendar,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      titulo: `Próximo vencimiento: ${proximo.concepto}`,
      detalle: `Día ${proximo.diaVencimiento} · ${fc(proximo.monto)}`,
      tipo: 'neutral',
    })
  }

  // 4. Ahorro proyectado
  if (resumen && resumen.ingresoTotal > 0) {
    const ahorro = resumen.ingresoTotal - resumen.totalGastosFijos - resumen.totalGastosVariables
    const pctAhorro = (ahorro / resumen.ingresoTotal) * 100
    if (ahorro > 0) {
      insights.push({
        icon: PiggyBank,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.1)',
        titulo: `Vas a ahorrar ${fc(ahorro)} este mes`,
        detalle: `${pctAhorro.toFixed(0)}% de tus ingresos`,
        tipo: 'positivo',
      })
    } else {
      insights.push({
        icon: AlertTriangle,
        color: '#f43f5e',
        bg: 'rgba(244,63,94,0.1)',
        titulo: 'Tus gastos superan tus ingresos',
        detalle: `Déficit de ${fc(Math.abs(ahorro))} este mes`,
        tipo: 'alerta',
      })
    }
  }

  // 5. Progreso de meta de ahorro
  const metas = dashboard?.metas || []
  if (metas.length > 0) {
    const meta = metas[0]
    const pct = (meta.montoActual / meta.montoObjetivo) * 100
    if (pct >= 100) {
      insights.push({
        icon: Target,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.1)',
        titulo: `🎉 Meta "${meta.titulo}" alcanzada`,
        detalle: `Ahorraste ${fc(meta.montoActual)}`,
        tipo: 'positivo',
      })
    } else if (pct > 0) {
      insights.push({
        icon: Target,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.1)',
        titulo: `Meta "${meta.titulo}": ${pct.toFixed(0)}% completada`,
        detalle: `Faltan ${fc(meta.montoObjetivo - meta.montoActual)}`,
        tipo: 'neutral',
      })
    }
  }

  // 6. Categoría más gastada
  const gastosVariables = dashboard?.gastosVariables || []
  if (gastosVariables.length > 0) {
    const porCategoria = gastosVariables.reduce((acc: any, g: any) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
      return acc
    }, {})
    const topCat = Object.entries(porCategoria).sort(([, a]: any, [, b]: any) => b - a)[0]
    if (topCat) {
      insights.push({
        icon: Lightbulb,
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.1)',
        titulo: `Categoría con más gasto: ${topCat[0]}`,
        detalle: `${fc(topCat[1] as number)} en gastos variables`,
        tipo: 'neutral',
      })
    }
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.slice(0, 6).map((insight, i) => {
        const Icon = insight.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 glass border border-[var(--border)] hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: insight.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: insight.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-1">{insight.titulo}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{insight.detalle}</div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
