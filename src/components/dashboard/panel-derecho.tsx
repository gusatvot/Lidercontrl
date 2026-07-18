'use client'

import { useAppStore } from '@/store/app'
import { useDashboard } from '@/hooks/use-data'
import { Users, Send, ArrowUpRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'

export function PanelDerecho() {
  const { data } = useDashboard()
  const { usuarioActivoId, usuarioActivoNombre } = useAppStore()
  const [monto, setMonto] = useState('')
  const [contactoSeleccionado, setContactoSeleccionado] = useState<string | null>(null)

  // Contactos: otros usuarios del sistema (mock desde datos)
  const contactos = [
    { id: '1', nombre: 'Familia', color: '#00ffa3', inicial: 'F' },
    { id: '2', nombre: 'Amigos', color: '#00a3ff', inicial: 'A' },
    { id: '3', nombre: 'Trabajo', color: '#ff3366', inicial: 'T' },
  ]

  const handleSendMoney = () => {
    if (!contactoSeleccionado) {
      toast.error('Seleccioná un contacto')
      return
    }
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('Ingresá un monto válido')
      return
    }
    toast.success(`Transferencia de $${parseFloat(monto).toLocaleString('es-AR')} enviada`)
    setMonto('')
    setContactoSeleccionado(null)
  }

  return (
    <aside className="w-80 shrink-0 h-screen overflow-y-auto p-4 border-l border-[var(--border)] bg-[var(--sidebar)] hidden lg:block">
      {/* Recent Contacts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            Contactos
          </h3>
          <span className="text-xs text-[var(--muted-foreground)]">{contactos.length} contactos</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {contactos.map((c) => (
            <button
              key={c.id}
              onClick={() => setContactoSeleccionado(c.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 cursor-pointer transition-all hover:scale-110 ${
                contactoSeleccionado === c.id ? 'scale-110' : ''
              }`}
              style={{
                background: `${c.color}25`,
                color: c.color,
                borderColor: contactoSeleccionado === c.id ? c.color : 'transparent',
              }}
              title={c.nombre}
            >
              {c.inicial}
            </button>
          ))}
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] cursor-pointer transition-all"
            title="Nuevo contacto"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Send Money */}
      <div className="mb-6 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-[var(--primary)]" />
          Enviar dinero
        </h3>

        {contactoSeleccionado && (
          <div className="mb-3 p-2 rounded-lg bg-[var(--secondary)] flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `${contactos.find((c) => c.id === contactoSeleccionado)?.color}25`,
                color: contactos.find((c) => c.id === contactoSeleccionado)?.color,
              }}
            >
              {contactos.find((c) => c.id === contactoSeleccionado)?.inicial}
            </div>
            <span className="text-sm font-medium">
              {contactos.find((c) => c.id === contactoSeleccionado)?.nombre}
            </span>
          </div>
        )}

        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Monto</label>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)] font-bold">$</span>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-3 py-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] text-lg font-bold text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <button
          onClick={handleSendMoney}
          className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold cursor-pointer hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,163,0.3)]"
        >
          Enviar dinero
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-3">Resumen del mes</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Ingresos</span>
            <span className="text-sm font-bold text-[var(--chart-1)]">
              +{formatCurrency(data?.resumen.ingresoTotal || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Gastos</span>
            <span className="text-sm font-bold text-[var(--destructive)]">
              −{formatCurrency((data?.resumen.totalGastosFijos || 0) + (data?.resumen.totalGastosVariables || 0))}
            </span>
          </div>
          <div className="h-px bg-[var(--border)] my-2" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Balance</span>
            <span className="text-sm font-bold text-[var(--primary)]">
              {formatCurrency((data?.resumen.ingresoTotal || 0) - (data?.resumen.totalGastosFijos || 0) - (data?.resumen.totalGastosVariables || 0))}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}