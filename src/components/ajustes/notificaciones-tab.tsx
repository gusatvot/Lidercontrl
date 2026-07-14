'use client'

import { useAppStore, type PreferenciasNotificaciones } from '@/store/app'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
  Bell, CalendarClock, CircleDollarSign, MessageSquare, PiggyBank, AlertTriangle, Volume2,
} from 'lucide-react'

interface ToggleItemProps {
  icon: any
  iconColor: string
  titulo: string
  descripcion: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}

function ToggleItem({ icon: Icon, iconColor, titulo, descripcion, checked, onCheckedChange }: ToggleItemProps) {
  return (
    <motion.div
      layout
      className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-[var(--muted)] transition-all"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${iconColor}15` }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{titulo}</div>
        <div className="text-xs text-[var(--muted-foreground)]">{descripcion}</div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={checked ? 'bg-[#6366f1]' : 'bg-white/10'}
      />
    </motion.div>
  )
}

export function NotificacionesTab() {
  const { notificaciones, setNotificaciones } = useAppStore()

  const toggle = (campo: keyof PreferenciasNotificaciones) => (v: boolean) => {
    setNotificaciones({ [campo]: v })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[var(--chart-4)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Notificaciones</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Elegí qué quieres que te avisemos</p>
          </div>
        </div>

        <div className="space-y-2">
          <ToggleItem
            icon={CalendarClock}
            iconColor="#6366f1"
            titulo="Vencimientos de gastos fijos"
            descripcion="Avisar antes del vencimiento de alquiler, servicios, etc."
            checked={notificaciones.vencimientos}
            onCheckedChange={toggle('vencimientos')}
          />

          <ToggleItem
            icon={CircleDollarSign}
            iconColor="#10b981"
            titulo="Transferencias recibidas"
            descripcion="Cuando alguien te envía o acepta una transferencia"
            checked={notificaciones.transferencias}
            onCheckedChange={toggle('transferencias')}
          />

          <ToggleItem
            icon={MessageSquare}
            iconColor="#8b5cf6"
            titulo="Mensajes nuevos"
            descripcion="Cuando recibís un mensaje de texto o audio en el chat"
            checked={notificaciones.mensajes}
            onCheckedChange={toggle('mensajes')}
          />

          <ToggleItem
            icon={PiggyBank}
            iconColor="#06b6d4"
            titulo="Metas de ahorro alcanzadas"
            descripcion="Cuando llegás al 100% de una meta de ahorro"
            checked={notificaciones.metas}
            onCheckedChange={toggle('metas')}
          />

          <ToggleItem
            icon={AlertTriangle}
            iconColor="#f43f5e"
            titulo="Exceso de presupuesto"
            descripcion="Cuando los gastos variables superan el presupuesto"
            checked={notificaciones.excesoPresupuesto}
            onCheckedChange={toggle('excesoPresupuesto')}
          />

          <ToggleItem
            icon={Volume2}
            iconColor="#ec4899"
            titulo="Sonido de notificaciones"
            descripcion="Reproducir un sonido al recibir avisos"
            checked={notificaciones.sonido}
            onCheckedChange={toggle('sonido')}
          />
        </div>

        <div className="mt-6 px-4 py-3 rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)]">
          <div className="text-xs text-[var(--muted-foreground)]">
            💡 Las notificaciones se guardan en tu navegador. Las preferencias se mantienen aunque cierres sesión.
          </div>
        </div>
      </div>
    </div>
  )
}
