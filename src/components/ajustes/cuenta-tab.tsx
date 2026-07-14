'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app'
import { useCuenta, useUpdateCuenta } from '@/hooks/use-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, Wallet, Calendar, Percent } from 'lucide-react'
import { motion } from 'framer-motion'
import { MONEDAS_INFO, type Moneda } from '@/store/app'

export function CuentaTab() {
  const { data: cuenta, isLoading } = useCuenta()
  const updateCuenta = useUpdateCuenta()
  const { finanzas, setFinanzas, apariencia, setApariencia } = useAppStore()

  const [ingresoMensual, setIngresoMensual] = useState('')
  const [metaAhorro, setMetaAhorro] = useState('')
  const [presupuestoVariables, setPresupuestoVariables] = useState('')
  const [saldo, setSaldo] = useState('')
  const [loadedId, setLoadedId] = useState<string | null>(null)

  useEffect(() => {
    if (cuenta && cuenta.id !== loadedId) {
      Promise.resolve().then(() => {
        setIngresoMensual(String(cuenta.ingresoMensual || ''))
        setMetaAhorro(String(cuenta.metaAhorroMensual || ''))
        setPresupuestoVariables(String(cuenta.presupuestoVariables || ''))
        setSaldo(String(cuenta.saldo || ''))
        setLoadedId(cuenta.id)
      })
    }
  }, [cuenta, loadedId])

  const handleGuardarCuenta = async () => {
    await updateCuenta.mutateAsync({
      ingresoMensual: parseFloat(ingresoMensual) || 0,
      metaAhorroMensual: parseFloat(metaAhorro) || 0,
      presupuestoVariables: parseFloat(presupuestoVariables) || 0,
      saldo: parseFloat(saldo) || 0,
    })
  }

  const totalRegla = finanzas.reglaNecesidades + finanzas.reglaDeseos + finanzas.reglaAhorros
  const reglaValida = totalRegla === 100

  const handleReglaChange = (campo: 'reglaNecesidades' | 'reglaDeseos' | 'reglaAhorros', valor: number) => {
    const nuevo = { ...finanzas, [campo]: valor }
    setFinanzas(nuevo)
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl p-6 glass">
        <div className="h-6 w-32 bg-[var(--muted)] rounded shimmer mb-4" />
        <div className="h-12 bg-[var(--muted)] rounded shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Configuración de cuenta */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[var(--chart-3)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Configuración de cuenta</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Tus montos base y objetivos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ingreso">Ingreso mensual fijo</Label>
            <Input
              id="ingreso"
              type="number"
              value={ingresoMensual}
              onChange={(e) => setIngresoMensual(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)] tabular"
              placeholder="0"
            />
            <p className="text-[0.7rem] text-[var(--muted-foreground)]">Sueldo base mensual</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta">Meta de ahorro mensual</Label>
            <Input
              id="meta"
              type="number"
              value={metaAhorro}
              onChange={(e) => setMetaAhorro(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)] tabular"
              placeholder="0"
            />
            <p className="text-[0.7rem] text-[var(--muted-foreground)]">Cuánto querés ahorrar por mes</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="presupuesto">Presupuesto gastos variables</Label>
            <Input
              id="presupuesto"
              type="number"
              value={presupuestoVariables}
              onChange={(e) => setPresupuestoVariables(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)] tabular"
              placeholder="0"
            />
            <p className="text-[0.7rem] text-[var(--muted-foreground)]">Tope para comida, ocio, etc.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo actual</Label>
            <Input
              id="saldo"
              type="number"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)] tabular"
              placeholder="0"
            />
            <p className="text-[0.7rem] text-[var(--muted-foreground)]">Saldo en cuenta ahora</p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleGuardarCuenta}
            disabled={updateCuenta.isPending}
            className="bg-gradient-to-br from-[#10b981] to-[#34d399] hover:from-[#10b981]/80 hover:to-[#34d399]/80 cursor-pointer"
          >
            {updateCuenta.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cuenta
          </Button>
        </div>
      </div>

      {/* Moneda */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[var(--chart-4)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Moneda</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Moneda principal para mostrar montos</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(MONEDAS_INFO) as Moneda[]).map((cod) => {
            const info = MONEDAS_INFO[cod]
            const active = apariencia.moneda === cod
            return (
              <button
                key={cod}
                onClick={() => setApariencia({ moneda: cod })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  active
                    ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] border-[rgba(99,102,241,0.3)]'
                    : 'glass border-[var(--border)] hover:border-white/20'
                }`}
              >
                <div className="text-xl font-bold">{info.simbolo}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{cod}</div>
                <div className="text-[0.65rem] text-[var(--muted-foreground)] mt-1">{info.nombre}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preferencias de finanzas */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[var(--chart-2)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Preferencias de finanzas</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Día de corte y recordatorios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="diaCorte">Día de corte del mes</Label>
            <Input
              id="diaCorte"
              type="number"
              min={1}
              max={28}
              value={finanzas.diaCorte}
              onChange={(e) => setFinanzas({ diaCorte: Math.max(1, Math.min(28, parseInt(e.target.value) || 1)) })}
              className="bg-[var(--muted)] border-[var(--border)] tabular"
            />
            <p className="text-[0.7rem] text-[var(--muted-foreground)]">Día del mes donde arranca el ciclo (1-28)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordatorio">Recordatorio de vencimientos</Label>
            <Select
              value={String(finanzas.recordatorioDias)}
              onValueChange={(v) => setFinanzas({ recordatorioDias: parseInt(v) })}
            >
              <SelectTrigger className="bg-[var(--muted)] border-[var(--border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-[var(--border)]">
                <SelectItem value="0">El mismo día</SelectItem>
                <SelectItem value="1">1 día antes</SelectItem>
                <SelectItem value="3">3 días antes</SelectItem>
                <SelectItem value="7">7 días antes (una semana)</SelectItem>
                <SelectItem value="14">14 días antes (dos semanas)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[0.7rem] text-[var(--muted-foreground)]">Cuándo avisarte antes de un vencimiento</p>
          </div>
        </div>

        {/* Regla 50/30/20 personalizable */}
        <div className="pt-6 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold">Regla de distribución personalizada</h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Personalizá cómo querés distribuir tus ingresos. La suma debe dar 100%.
          </p>

          <div className="space-y-4">
            <ReglaSlider
              label="Necesidades"
              value={finanzas.reglaNecesidades}
              onChange={(v) => handleReglaChange('reglaNecesidades', v)}
              color="#6366f1"
              descripcion="Gastos fijos: alquiler, servicios, deudas"
            />
            <ReglaSlider
              label="Deseos"
              value={finanzas.reglaDeseos}
              onChange={(v) => handleReglaChange('reglaDeseos', v)}
              color="#8b5cf6"
              descripcion="Gastos variables: ocio, comida, compras"
            />
            <ReglaSlider
              label="Ahorros"
              value={finanzas.reglaAhorros}
              onChange={(v) => handleReglaChange('reglaAhorros', v)}
              color="#10b981"
              descripcion="Ahorro e inversión"
            />
          </div>

          <div className={`mt-4 px-4 py-2 rounded-xl text-sm ${
            reglaValida ? 'bg-[rgba(16,185,129,0.1)] text-[var(--chart-3)]' : 'bg-[rgba(244,63,94,0.1)] text-[var(--destructive)]'
          }`}>
            Total: {totalRegla}% {reglaValida ? '✓' : '(debe ser 100%)'}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReglaSlider({
  label,
  value,
  onChange,
  color,
  descripcion,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
  descripcion: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div>
          <span className="text-sm font-medium" style={{ color }}>{label}</span>
          <span className="text-xs text-[var(--muted-foreground)] ml-2">{descripcion}</span>
        </div>
        <span className="text-sm font-bold tabular" style={{ color }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, rgba(255,255,255,0.05) ${value}%, rgba(255,255,255,0.05) 100%)`,
        }}
      />
    </div>
  )
}
