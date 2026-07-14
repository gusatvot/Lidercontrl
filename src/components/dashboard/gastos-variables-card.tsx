'use client'

import { motion } from 'framer-motion'
import { Trash2, ShoppingCart, Pencil } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { useDeleteGastoVariable } from '@/hooks/use-data'
import { useAppStore } from '@/store/app'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'
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

interface GastoVariable {
  id: string
  concepto: string
  categoria: string
  monto: number
  fecha: string
}

interface GastosVariablesCardProps {
  gastos: GastoVariable[]
  total: number
  presupuesto: number
  isLoading?: boolean
}

const CATEGORIA_COLORS: Record<string, string> = {
  Comida: '#10b981',
  Ocio: '#8b5cf6',
  Transporte: '#06b6d4',
  Salud: '#f43f5e',
  Ropa: '#ec4899',
  Regalos: '#f59e0b',
  Imprevistos: '#ef4444',
  Otros: '#8b8b94',
}

export function GastosVariablesCard({
  gastos,
  total,
  presupuesto,
  isLoading,
}: GastosVariablesCardProps) {
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const del = useDeleteGastoVariable()
  const abrirGastoDialog = useAppStore((s) => s.abrirGastoDialog)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const porcentaje = presupuesto > 0 ? Math.min((total / presupuesto) * 100, 100) : 0
  const restante = presupuesto - total
  const colorBarra = porcentaje > 90 ? '#f43f5e' : porcentaje > 70 ? '#f59e0b' : '#10b981'

  if (isLoading) {
    return (
      <div className="rounded-3xl p-6 glass">
        <Skeleton className="h-5 w-32 mb-6 shimmer" />
        <Skeleton className="h-2 w-full mb-3 shimmer" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full mb-2 shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 glass">
      <div className="flex justify-between items-center mb-2">
        <div className="text-base font-semibold flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[var(--chart-4)]" />
          Gastos Diarios
        </div>
        <div className="text-xs text-[var(--muted-foreground)] tabular">
          {fc(total)} / {fc(presupuesto)}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden mb-1">
        <motion.div
          className="h-full rounded-full"
          style={{ background: colorBarra, boxShadow: `0 0 12px ${colorBarra}` }}
          initial={{ width: 0 }}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="text-[0.7rem] text-[var(--muted-foreground)] mb-4">
        {porcentaje.toFixed(0)}% usado ·{' '}
        {restante >= 0 ? (
          <span className="text-[var(--chart-3)]">{fc(restante)} disponibles</span>
        ) : (
          <span className="text-[var(--destructive)]">{fc(Math.abs(restante))} excedido</span>
        )}
      </div>

      {/* Lista de gastos */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto">
        {gastos.length === 0 ? (
          <div className="text-xs text-[var(--muted-foreground)] py-6 text-center">
            Sin gastos variables este mes
          </div>
        ) : (
          gastos.map((g, i) => {
            const color = CATEGORIA_COLORS[g.categoria] || '#8b8b94'
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--muted)] group"
                onMouseEnter={() => setHoveredId(g.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{g.concepto}</div>
                  <div className="text-[0.7rem] text-[var(--muted-foreground)]">
                    {g.categoria} · {formatDate(g.fecha)}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular">
                  {fc(g.monto)}
                </div>
                <div className={`flex items-center gap-1 transition-opacity ${hoveredId === g.id ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={() => abrirGastoDialog('variable', g.id)}
                    className="p-1 rounded hover:bg-[var(--secondary)] hover:text-[var(--foreground)] cursor-pointer"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-1 rounded hover:bg-[rgba(244,63,94,0.15)] hover:text-[var(--destructive)] cursor-pointer"
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
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
