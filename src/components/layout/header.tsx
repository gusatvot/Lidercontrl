'use client'

import { useAppStore } from '@/store/app'
import { useSessionActiva } from '@/hooks/use-data'
import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function Header({ onAbrirCmdk }: { onAbrirCmdk?: () => void }) {
  const { mes, anio, mesAnterior, mesSiguiente, usuarioActivoNombre } = useAppStore()
  const { session } = useSessionActiva()
  const [notifOpen, setNotifOpen] = useState(false)

  const usuario = session?.user
  const saludo = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold">
          {saludo()}, {usuario?.nombre || usuarioActivoNombre}! 👋
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          {MESES[mes - 1]} {anio}
        </p>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-3">
        {/* Buscador */}
        <button
          onClick={onAbrirCmdk}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] cursor-pointer transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Buscar...</span>
          <kbd className="ml-4 px-1.5 py-0.5 rounded-md bg-[var(--secondary)] text-[0.65rem] font-mono">⌘K</kbd>
        </button>

        {/* Notificaciones */}
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative w-11 h-11 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--secondary)] transition-all"
        >
          <Bell className="w-5 h-5 text-[var(--foreground)]" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[0.65rem] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(0,255,163,0.5)]">
            2
          </span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: `${usuario?.color || '#00ffa3'}25`,
              color: usuario?.color || '#00ffa3',
            }}
          >
            {(usuario?.nombre || usuarioActivoNombre).slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold">{usuario?.nombre || usuarioActivoNombre}</div>
            <div className="text-[0.65rem] text-[var(--muted-foreground)]">@{usuario?.username || 'demo'}</div>
          </div>
        </div>
      </div>
    </header>
  )
}