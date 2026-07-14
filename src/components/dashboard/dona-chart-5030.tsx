'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

interface DonaChart5030Props {
  distribucion?: {
    necesidades: { monto: number; porcentaje: number; real: number }
    deseos: { monto: number; porcentaje: number; real: number }
    ahorros: { monto: number; porcentaje: number; real: number }
  }
  ingresoTotal: number
  isLoading?: boolean
}

// SVG: r = 80, circunferencia = 2*PI*80 = 502.65
const R = 80
const C = 2 * Math.PI * R

export function DonaChart5030({ distribucion, ingresoTotal, isLoading }: DonaChart5030Props) {
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)

  if (isLoading || !distribucion) {
    return (
      <div className="rounded-3xl p-6 glass flex flex-col items-center">
        <Skeleton className="h-5 w-40 mb-6 shimmer" />
        <Skeleton className="w-[200px] h-[200px] rounded-full mb-6 shimmer" />
        <div className="w-full space-y-2">
          <Skeleton className="h-8 w-full shimmer" />
          <Skeleton className="h-8 w-full shimmer" />
          <Skeleton className="h-8 w-full shimmer" />
        </div>
      </div>
    )
  }

  // Distribución de los segmentos por porcentaje objetivo
  const { necesidades, deseos, ahorros } = distribucion
  const segNeces = (necesidades.porcentaje / 100) * C
  const segDeseos = (deseos.porcentaje / 100) * C
  const segAhorros = (ahorros.porcentaje / 100) * C

  // Offsets acumulativos (cada segmento empieza donde termina el anterior)
  const offNeces = 0
  const offDeseos = -segNeces
  const offAhorros = -(segNeces + segDeseos)

  const segmentos = [
    {
      nombre: 'Necesidades',
      pct: necesidades.porcentaje,
      montoIdeal: necesidades.monto,
      real: necesidades.real,
      color: '#6366f1',
      colorSoft: '#818cf8',
      dashArray: `${segNeces} ${C - segNeces}`,
      dashOffset: offNeces,
    },
    {
      nombre: 'Deseos',
      pct: deseos.porcentaje,
      montoIdeal: deseos.monto,
      real: deseos.real,
      color: '#8b5cf6',
      colorSoft: '#a78bfa',
      dashArray: `${segDeseos} ${C - segDeseos}`,
      dashOffset: offDeseos,
    },
    {
      nombre: 'Ahorros',
      pct: ahorros.porcentaje,
      montoIdeal: ahorros.monto,
      real: ahorros.real,
      color: '#10b981',
      colorSoft: '#34d399',
      dashArray: `${segAhorros} ${C - segAhorros}`,
      dashOffset: offAhorros,
    },
  ]

  return (
    <div className="rounded-3xl p-6 glass flex flex-col items-center">
      <div className="w-full text-center mb-6">
        <div className="text-base font-semibold">Distribución 50/30/20</div>
        <div className="text-[0.7rem] text-[var(--muted-foreground)] mt-1">
          Ideal vs. real de tus ingresos
        </div>
      </div>

      {/* Dona SVG */}
      <div className="relative w-[200px] h-[200px] mb-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Círculo de fondo */}
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="24"
          />

          {/* Segmentos animados */}
          {segmentos.map((seg, i) => (
            <motion.circle
              key={seg.nombre}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              transform="rotate(-90 100 100)"
              style={{ filter: `drop-shadow(0 0 8px ${seg.color}99)` }}
              initial={{ opacity: 0, strokeDasharray: `0 ${C}` }}
              animate={{ opacity: 1, strokeDasharray: seg.dashArray }}
              transition={{ delay: 0.2 + i * 0.2, duration: 0.8, ease: 'easeOut' }}
            />
          ))}

          {/* Defs de gradientes */}
          <defs>
            <linearGradient id="gradNeces" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="gradDeseos" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="gradAhorros" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>

        {/* Centro */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-[0.7rem] text-[var(--muted-foreground)]">Total</div>
          <div className="text-[1.5rem] font-bold tabular">
            {fc(ingresoTotal)}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="w-full space-y-3">
        {segmentos.map((seg) => {
          const diff = seg.real - seg.montoIdeal
          const diffPct = seg.montoIdeal > 0 ? Math.round((diff / seg.montoIdeal) * 100) : 0
          return (
            <div
              key={seg.nombre}
              className="flex justify-between items-center text-[0.85rem] px-3 py-2 bg-[var(--card)] rounded-xl"
            >
              <div className="flex items-center gap-2.5 text-[var(--muted-foreground)]">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: seg.color }}
                />
                <span>{seg.nombre}</span>
                <span className="text-[0.7rem] font-semibold text-[var(--foreground)]">
                  {seg.pct}%
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold tabular">
                  {fc(seg.real)}
                </div>
                <div
                  className={`text-[0.65rem] tabular ${
                    diff <= 0 ? 'text-[var(--chart-3)]' : 'text-[var(--destructive)]'
                  }`}
                >
                  {diff > 0 ? '+' : ''}{fc(diff)} vs ideal
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
