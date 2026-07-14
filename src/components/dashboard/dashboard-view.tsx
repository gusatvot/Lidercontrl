'use client'

import { useDashboard } from '@/hooks/use-data'
import { useAppStore, type WidgetId } from '@/store/app'
import { formatCurrency } from '@/lib/format'
import { BentoSummary } from './bento-summary'
import { DonaChart5030 } from './dona-chart-5030'
import { GastosVariablesCard } from './gastos-variables-card'
import { InsightsCards } from './insights-cards'
import { DashboardCustomizer } from './dashboard-customizer'
import { Settings2, Eye } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

export function DashboardView() {
  const { data, isLoading } = useDashboard()
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const { widgets } = useAppStore()
  // Suscribirse al formato de moneda para re-renderizar cuando cambie
  const formatoMoneda = useAppStore((s) => s.apariencia.formatoMoneda)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  // Ordenar widgets según el orden guardado
  const sortedWidgets = [...widgets].sort((a, b) => a.orden - b.orden)

  // Widgets que ocupan todo el ancho (ambas columnas)
  const wideWidgets: WidgetId[] = ['bento', 'insights']

  // Renderizar un widget según su ID
  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case 'bento':
        return <BentoSummary resumen={data?.resumen} isLoading={isLoading} />
      case 'insights':
        return <InsightsCards />
      case 'dona':
        return (
          <DonaChart5030
            distribucion={data?.distribucion}
            ingresoTotal={data?.resumen.ingresoMensual || 0}
            isLoading={isLoading}
          />
        )
      case 'gastosVariables':
        return (
          <div className="rounded-3xl p-6 glass h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="text-base font-semibold">Movimientos del mes</div>
              <span className="text-xs text-[var(--muted-foreground)]">
                {isLoading ? '' : `${(data?.gastosFijos || []).length + (data?.gastosVariables || []).length + (data?.ingresos || []).length} movimientos`}
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl shimmer" />
                ))}
              </div>
            ) : (() => {
              const movs = [
                ...(data?.ingresos || []).map((i: any) => ({
                  id: i.id, concepto: i.concepto, categoria: i.categoria,
                  monto: i.monto, tipo: 'ingreso' as const, fecha: i.fecha,
                })),
                ...(data?.gastosVariables || []).map((g: any) => ({
                  id: g.id, concepto: g.concepto, categoria: g.categoria,
                  monto: -g.monto, tipo: 'gasto' as const, fecha: g.fecha,
                })),
                ...(data?.gastosFijos || []).map((g: any) => ({
                  id: g.id, concepto: g.concepto, categoria: g.categoria,
                  monto: -g.monto, tipo: 'gasto' as const,
                  fecha: new Date(),
                })),
              ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 8)

              if (movs.length === 0) {
                return (
                  <div className="text-sm text-[var(--muted-foreground)] py-8 text-center">
                    Sin movimientos este mes
                  </div>
                )
              }

              return (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {movs.map((m: any) => {
                    const esIngreso = m.monto > 0
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--muted)] transition-all">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            esIngreso ? 'bg-[rgba(16,185,129,0.15)]' : 'bg-[rgba(244,63,94,0.15)]'
                          }`}
                        >
                          <span className="text-xs font-bold" style={{ color: esIngreso ? '#10b981' : '#f43f5e' }}>
                            {esIngreso ? '+' : '−'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{m.concepto}</div>
                          <div className="text-[0.7rem] text-[var(--muted-foreground)]">{m.categoria}</div>
                        </div>
                        <div
                          className="text-sm font-bold tabular shrink-0"
                          style={{ color: esIngreso ? '#10b981' : '#f43f5e' }}
                        >
                          {esIngreso ? '+' : '−'}{fc(Math.abs(m.monto))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )
      case 'saldo':
        return (
          <div className="rounded-3xl p-6 glass h-full">
            <div className="text-base font-semibold mb-1">Saldo Disponible</div>
            <div className="text-[0.7rem] text-[var(--muted-foreground)] mb-6">Cuenta principal</div>
            <div className="text-[2.5rem] font-bold tabular bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent">
              {isLoading ? '—' : fc((data?.resumen.saldo || 0) - (data?.resumen.totalGastosFijos || 0) - (data?.resumen.totalGastosVariables || 0))}
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Ingreso del mes</span>
                <span className="font-semibold tabular text-[var(--chart-3)]">
                  {isLoading ? '—' : `+${fc(data?.resumen.ingresoTotal || 0)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Ingresos extras</span>
                <span className="font-semibold tabular">
                  {isLoading ? '—' : fc(data?.resumen.totalIngresosExtras || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Total gastos</span>
                <span className="font-semibold tabular text-[var(--destructive)]">
                  {isLoading ? '—' : `−${fc((data?.resumen.totalGastosFijos || 0) + (data?.resumen.totalGastosVariables || 0))}`}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Ahorro proyectado</span>
                <span className="font-semibold tabular text-[var(--chart-3)]">
                  {isLoading ? '—' : `+${fc(Math.max(0, ((data?.resumen.ingresoTotal || 0) - (data?.resumen.totalGastosFijos || 0) - (data?.resumen.totalGastosVariables || 0))))}`}
                </span>
              </div>
            </div>
          </div>
        )
      case 'metas':
        return (
          <div className="rounded-3xl p-6 glass h-full">
            <div className="text-base font-semibold mb-1">Metas de Ahorro</div>
            <div className="text-[0.7rem] text-[var(--muted-foreground)] mb-6">Progreso del mes</div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl shimmer" />
                ))}
              </div>
            ) : (data?.metas || []).length === 0 ? (
              <div className="text-xs text-[var(--muted-foreground)] py-8 text-center">
                No tenés metas de ahorro este mes
              </div>
            ) : (
              <div className="space-y-4">
                {data?.metas.map((meta: any) => {
                  const pct = Math.min((meta.montoActual / meta.montoObjetivo) * 100, 100)
                  return (
                    <div key={meta.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">{meta.titulo}</div>
                        <div className="text-xs text-[var(--muted-foreground)] tabular">
                          {fc(meta.montoActual)} / {fc(meta.montoObjetivo)}
                        </div>
                      </div>
                      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--chart-2)]"
                          style={{ width: `${pct}%`, boxShadow: '0 0 10px #6366f1' }}
                        />
                      </div>
                      <div className="text-[0.7rem] text-[var(--muted-foreground)] mt-1">
                        {pct.toFixed(0)}% alcanzado
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Si todos los widgets están ocultos
  const visibles = sortedWidgets.filter((w) => w.visible)
  if (visibles.length === 0) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl p-12 glass text-center">
          <Eye className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <div className="text-sm text-[var(--muted-foreground)] mb-4">
            No tenés widgets visibles en el dashboard.
          </div>
          <button
            onClick={() => setCustomizerOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)] text-sm font-semibold cursor-pointer"
          >
            Personalizar dashboard
          </button>
        </div>
        <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Botón personalizar */}
      <div className="flex justify-end">
        <button
          onClick={() => setCustomizerOpen(true)}
          className="px-3 py-1.5 rounded-xl glass text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Personalizar
        </button>
      </div>

      {/* Grilla bidimensional de widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {sortedWidgets
            .filter((w) => w.visible)
            .map((widget) => {
              const isWide = wideWidgets.includes(widget.id)
              return (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'min-w-0',
                    // Widgets anchos ocupan ambas columnas
                    isWide && 'lg:col-span-2'
                  )}
                >
                  {renderWidget(widget.id)}
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>

      {/* Modal personalizador */}
      <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
    </div>
  )
}
