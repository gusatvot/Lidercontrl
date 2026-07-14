'use client'

import { useIngresos, useDeleteIngreso } from '@/hooks/use-data'
import { useDashboard } from '@/hooks/use-data'
import { formatCurrency, formatDate } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { TrendingUp, Trash2, Repeat, Plus, Wallet, Gift, RotateCcw, Briefcase, ShoppingCart, Pencil } from 'lucide-react'
import { IngresoDialog } from '@/components/forms/ingreso-dialog'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/app'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

const CATEGORIA_INGRESO_INFO: Record<string, { color: string; icon: any }> = {
  Sueldo: { color: '#10b981', icon: Wallet },
  Extra: { color: '#6366f1', icon: Plus },
  Regalo: { color: '#ec4899', icon: Gift },
  Reembolso: { color: '#06b6d4', icon: RotateCcw },
  Inversión: { color: '#f59e0b', icon: TrendingUp },
  Freelance: { color: '#8b5cf6', icon: Briefcase },
  Ventas: { color: '#84cc16', icon: ShoppingCart },
  Otros: { color: '#8b8b94', icon: Plus },
}

export function IngresosView() {
  const { data: ingresos, isLoading } = useIngresos()
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const { data: dashboard } = useDashboard()
  const del = useDeleteIngreso()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const abrirNuevo = () => {
    setEditandoId(null)
    setDialogOpen(true)
  }

  const abrirEditar = (id: string) => {
    setEditandoId(id)
    setDialogOpen(true)
  }

  const resumen = dashboard?.resumen
  const totalIngresos = resumen?.ingresoTotal || 0
  const totalFijos = resumen?.totalIngresosFijos || 0
  const totalExtras = resumen?.totalIngresosExtras || 0

  // Agrupar por categoría
  const porCategoria = (ingresos || []).reduce((acc: Record<string, number>, ing: any) => {
    acc[ing.categoria] = (acc[ing.categoria] || 0) + ing.monto
    return acc
  }, {})

  const categoriasArray = Object.entries(porCategoria).sort(([, a]: any, [, b]: any) => b - a)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 sm:col-span-4 rounded-3xl p-6 glass relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: '#10b981' }} />
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Total del mes
          </div>
          <div className="text-[1.8rem] font-bold tabular text-[var(--chart-3)]">
            {isLoading ? '—' : fc(totalIngresos)}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-2">
            {(ingresos || []).length} ingresos registrados
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="col-span-12 sm:col-span-4 rounded-3xl p-6 glass relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: '#6366f1' }} />
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-2 flex items-center gap-2">
            <Repeat className="w-3 h-3" /> Fijos (recurrentes)
          </div>
          <div className="text-[1.8rem] font-bold tabular">
            {isLoading ? '—' : fc(totalFijos)}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-2">
            Sueldo y otros ingresos fijos
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="col-span-12 sm:col-span-4 rounded-3xl p-6 glass relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: '#f59e0b' }} />
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-2 flex items-center gap-2">
            <Plus className="w-3 h-3" /> Extras (puntuales)
          </div>
          <div className="text-[1.8rem] font-bold tabular text-[var(--chart-4)]">
            {isLoading ? '—' : fc(totalExtras)}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-2">
            Freelance, regalos, reembolsos
          </div>
        </motion.div>
      </div>

      {/* Botón agregar */}
      <div className="flex justify-end">
        <button
          onClick={abrirNuevo}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] text-[var(--foreground)] text-sm font-semibold border-none cursor-pointer flex items-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.6)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Ingreso
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Lista de ingresos */}
        <div className="col-span-12 lg:col-span-8 rounded-3xl p-6 glass">
          <div className="flex justify-between items-center mb-6">
            <div className="text-base font-semibold">Historial de Ingresos</div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full shimmer" />
              ))}
            </div>
          ) : (ingresos || []).length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)] py-12 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
              No tenés ingresos registrados este mes.
              <br />
              <button
                onClick={abrirNuevo}
                className="mt-3 text-[var(--chart-3)] hover:underline cursor-pointer"
              >
                Agregar tu primer ingreso
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {(ingresos || []).map((ing: any, i: number) => {
                const catInfo = CATEGORIA_INGRESO_INFO[ing.categoria] || CATEGORIA_INGRESO_INFO.Otros
                const Icon = catInfo.icon
                return (
                  <motion.div
                    key={ing.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--muted)] group"
                    onMouseEnter={() => setHoveredId(ing.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${catInfo.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: catInfo.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {ing.concepto}
                        {ing.esFijo && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[rgba(99,102,241,0.15)] text-[var(--primary)] text-[0.65rem] font-semibold">
                            <Repeat className="w-2.5 h-2.5" />
                            Fijo
                          </span>
                        )}
                      </div>
                      <div className="text-[0.7rem] text-[var(--muted-foreground)]">
                        {ing.categoria} · {formatDate(ing.fecha)}
                      </div>
                    </div>
                    <div className="text-base font-bold tabular text-[var(--chart-3)]">
                      +{fc(ing.monto)}
                    </div>
                    <div className={`flex items-center gap-1 transition-opacity ${hoveredId === ing.id ? 'opacity-100' : 'opacity-0'}`}>
                      <button
                        onClick={() => abrirEditar(ing.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--secondary)] hover:text-[var(--foreground)] cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.15)] hover:text-[var(--destructive)] cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong border-[var(--border)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Vas a eliminar <strong>{ing.concepto}</strong> (+{fc(ing.monto)}).
                              Se restará de tu saldo disponible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => del.mutate(ing.id)}
                              className="bg-[#f43f5e] hover:bg-[#f43f5e]/80 cursor-pointer"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resumen por categoría */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl p-6 glass">
          <div className="text-base font-semibold mb-4">Por categoría</div>
          {isLoading ? (
            <Skeleton className="h-40 w-full shimmer" />
          ) : categoriasArray.length === 0 ? (
            <div className="text-xs text-[var(--muted-foreground)] py-8 text-center">
              Sin datos
            </div>
          ) : (
            <div className="space-y-3">
              {categoriasArray.map(([cat, monto]: any) => {
                const info = CATEGORIA_INGRESO_INFO[cat] || CATEGORIA_INGRESO_INFO.Otros
                const pct = totalIngresos > 0 ? ((monto / totalIngresos) * 100).toFixed(0) : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: info.color }}
                        />
                        {cat}
                      </span>
                      <span className="tabular font-semibold text-[var(--chart-3)]">
                        +{fc(monto)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: info.color,
                          boxShadow: `0 0 8px ${info.color}`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de crear/editar ingreso */}
      <IngresoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editandoId={editandoId}
      />
    </div>
  )
}
