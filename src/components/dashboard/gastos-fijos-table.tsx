'use client'

import { motion } from 'framer-motion'
import { Pencil, Trash2, Check, RotateCcw, MoreVertical } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useToggleEstadoGastoFijo, useDeleteGastoFijo } from '@/hooks/use-data'
import { useAppStore } from '@/store/app'
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
import { Skeleton } from '@/components/ui/skeleton'
import { MESES } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

interface GastoFijo {
  id: string
  concepto: string
  categoria: string
  monto: number
  diaVencimiento: number
  mes: number
  anio: number
  estado: 'pagado' | 'pendiente'
  nota?: string | null
}

interface GastosFijosTableProps {
  gastos: GastoFijo[]
  isLoading?: boolean
  compact?: boolean
}

const CATEGORIA_COLORS: Record<string, string> = {
  Vivienda: '#6366f1',
  Educación: '#8b5cf6',
  Deudas: '#f43f5e',
  Servicios: '#f59e0b',
  Salud: '#10b981',
  Seguros: '#06b6d4',
  Suscripciones: '#ec4899',
  Transporte: '#84cc16',
  Otros: '#8b8b94',
}

export function GastosFijosTable({ gastos, isLoading, compact = false }: GastosFijosTableProps) {
  const toggle = useToggleEstadoGastoFijo()
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const del = useDeleteGastoFijo()
  const abrirGastoDialog = useAppStore((s) => s.abrirGastoDialog)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleToggle = (g: GastoFijo) => {
    const nuevo = g.estado === 'pagado' ? 'pendiente' : 'pagado'
    toggle.mutate({ id: g.id, estado: nuevo })
    toast.success(`${g.concepto} marcado como ${nuevo}`)
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl p-6 glass">
        <Skeleton className="h-5 w-40 mb-6 shimmer" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full mb-2 shimmer" />
        ))}
      </div>
    )
  }

  if (gastos.length === 0) {
    return (
      <div className="rounded-3xl p-6 glass">
        <div className="text-sm font-semibold mb-1">Gastos Fijos del Mes</div>
        <div className="text-xs text-[var(--muted-foreground)] py-12 text-center">
          No hay gastos fijos registrados este mes.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 glass">
      <div className="flex justify-between items-center mb-6">
        <div className="text-base font-semibold flex items-center gap-2">
          Gastos Fijos del Mes
          <span className="text-xs text-[var(--muted-foreground)] font-normal">
            ({gastos.length})
          </span>
        </div>
        {!compact && (
          <button className="px-3 py-1.5 rounded-lg glass text-xs font-medium hover:bg-[var(--secondary)] transition-all cursor-pointer">
            Ver todos
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[0.7rem] text-[var(--muted-foreground)] uppercase tracking-wider pb-3 font-medium">
                Concepto
              </th>
              <th className="text-left text-[0.7rem] text-[var(--muted-foreground)] uppercase tracking-wider pb-3 font-medium hidden sm:table-cell">
                Categoría
              </th>
              <th className="text-left text-[0.7rem] text-[var(--muted-foreground)] uppercase tracking-wider pb-3 font-medium">
                Vencimiento
              </th>
              <th className="text-left text-[0.7rem] text-[var(--muted-foreground)] uppercase tracking-wider pb-3 font-medium">
                Monto
              </th>
              <th className="text-left text-[0.7rem] text-[var(--muted-foreground)] uppercase tracking-wider pb-3 font-medium">
                Estado
              </th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g, i) => {
              const color = CATEGORIA_COLORS[g.categoria] || '#8b8b94'
              return (
                <motion.tr
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-[var(--border)] group"
                  onMouseEnter={() => setHoveredId(g.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td className="py-4 text-sm font-semibold">
                    {g.concepto}
                    {g.nota && (
                      <div className="text-[0.7rem] text-[var(--muted-foreground)] font-normal mt-0.5">
                        {g.nota}
                      </div>
                    )}
                  </td>
                  <td className="py-4 text-sm text-[var(--muted-foreground)] hidden sm:table-cell">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: color }}
                      />
                      {g.categoria}
                    </span>
                  </td>
                  <td className="py-4 text-sm tabular">
                    {String(g.diaVencimiento).padStart(2, '0')} {MESES[g.mes - 1].slice(0, 3)}
                  </td>
                  <td className="py-4 text-sm font-semibold tabular">
                    {fc(g.monto)}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleToggle(g)}
                      className={`px-3 py-1.5 rounded-full text-[0.7rem] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 ${
                        g.estado === 'pagado'
                          ? 'bg-[rgba(16,185,129,0.1)] text-[var(--chart-3)]'
                          : 'bg-[rgba(245,158,11,0.1)] text-[var(--chart-4)]'
                      }`}
                      title={g.estado === 'pagado' ? 'Marcar como pendiente' : 'Marcar como pagado'}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          g.estado === 'pagado' ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]' : 'bg-[#f59e0b]'
                        }`}
                      />
                      {g.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="py-4">
                    <div className={`flex items-center gap-1 transition-opacity ${hoveredId === g.id ? 'opacity-100' : 'opacity-0'}`}>
                      <button
                        onClick={() => abrirGastoDialog('fijo', g.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--secondary)] cursor-pointer"
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
                            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Vas a eliminar <strong>{g.concepto}</strong> ({fc(g.monto)}).
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => del.mutate(g.id)}
                              className="bg-[#f43f5e] hover:bg-[#f43f5e]/80 cursor-pointer"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
