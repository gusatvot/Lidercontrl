'use client'

import { useGastosFijos } from '@/hooks/use-data'
import { GastosFijosTable } from '@/components/dashboard/gastos-fijos-table'
import { useAppStore } from '@/store/app'
import { PiggyBank, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useFormatoMoneda } from '@/hooks/use-formato-moneda'

export function GastosFijosView() {
  const { data, isLoading } = useGastosFijos()
  const formato = useFormatoMoneda()
  const fc = (amount: number) => formatCurrency(amount, formato)
  const { abrirGastoDialog } = useAppStore()

  const total = (data || []).reduce((s: number, g: any) => s + g.monto, 0)
  const pagado = (data || []).filter((g: any) => g.estado === 'pagado').reduce((s: number, g: any) => s + g.monto, 0)
  const pendiente = total - pagado
  const proximosAVencer = (data || [])
    .filter((g: any) => g.estado === 'pendiente')
    .sort((a: any, b: any) => a.diaVencimiento - b.diaVencimiento)
    .slice(0, 3)

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 sm:col-span-4 rounded-3xl p-6 glass relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: '#6366f1' }} />
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-2">Total del mes</div>
          <div className="text-[1.8rem] font-bold tabular">{fc(total)}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-2">{(data || []).length} gastos registrados</div>
        </div>
        <div className="col-span-12 sm:col-span-4 rounded-3xl p-6 glass relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: '#10b981' }} />
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-2">Ya pagado</div>
          <div className="text-[1.8rem] font-bold tabular text-[var(--chart-3)]">{fc(pagado)}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-2">
            {total > 0 ? Math.round((pagado / total) * 100) : 0}% del total
          </div>
        </div>
        <div className="col-span-12 sm:col-span-4 rounded-3xl p-6 glass relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-50 blur-3xl" style={{ background: '#f59e0b' }} />
          <div className="text-xs text-[var(--muted-foreground)] font-medium mb-2">Pendiente</div>
          <div className="text-[1.8rem] font-bold tabular text-[var(--chart-4)]">{fc(pendiente)}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-2">
            {(data || []).filter((g: any) => g.estado === 'pendiente').length} gastos por pagar
          </div>
        </div>
      </div>

      {/* Próximos a vencer */}
      {proximosAVencer.length > 0 && (
        <div className="rounded-3xl p-6 glass">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-[var(--chart-4)]" />
            <div className="text-base font-semibold">Próximos a vencer</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {proximosAVencer.map((g: any) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]"
              >
                <div className="text-xs text-[var(--chart-4)] mb-1">Día {g.diaVencimiento}</div>
                <div className="text-sm font-semibold">{g.concepto}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{g.categoria}</div>
                <div className="text-base font-bold tabular mt-2">{fc(g.monto)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón agregar */}
      <div className="flex justify-end">
        <button
          onClick={() => abrirGastoDialog('fijo')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)] text-sm font-semibold border-none cursor-pointer flex items-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Gasto Fijo
        </button>
      </div>

      {/* Tabla completa */}
      <GastosFijosTable gastos={data || []} isLoading={isLoading} />
    </div>
  )
}
