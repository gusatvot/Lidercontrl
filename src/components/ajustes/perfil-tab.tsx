'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app'
import { useActualizarUsuario, useUsuarios } from '@/hooks/use-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Save, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const COLORES = [
  { hex: '#6366f1', nombre: 'Índigo' },
  { hex: '#8b5cf6', nombre: 'Violeta' },
  { hex: '#10b981', nombre: 'Esmeralda' },
  { hex: '#f43f5e', nombre: 'Rosa' },
  { hex: '#f59e0b', nombre: 'Ámbar' },
  { hex: '#06b6d4', nombre: 'Cyan' },
  { hex: '#ec4899', nombre: 'Pink' },
  { hex: '#84cc16', nombre: 'Lima' },
]

export function PerfilTab() {
  const { usuarioActivoId, usuarioActivoNombre, usuarioActivoColor } = useAppStore()
  const { data: usuarios } = useUsuarios()
  const actualizar = useActualizarUsuario()

  // Buscar el usuario activo en la lista
  const usuario = (usuarios || []).find((u: any) => u.id === usuarioActivoId) || {
    id: usuarioActivoId,
    nombre: usuarioActivoNombre,
    email: '',
    color: usuarioActivoColor,
  }

  const [nombre, setNombre] = useState(usuario.nombre)
  const [email, setEmail] = useState(usuario.email || '')
  const [color, setColor] = useState(usuario.color || usuarioActivoColor)

  const handleGuardar = async () => {
    if (!usuarioActivoId) {
      toast.error('No hay usuario activo')
      return
    }
    if (!nombre.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    await actualizar.mutateAsync({
      id: usuarioActivoId,
      data: { nombre: nombre.trim(), email: email.trim(), color },
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
            <User className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Perfil</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Tu información personal</p>
          </div>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: `${color}25`, color }}
          >
            {nombre.slice(0, 1).toUpperCase() || '?'}
          </div>
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">Vista previa</div>
            <div className="text-base font-semibold">{nombre || 'Sin nombre'}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{email || 'Sin email'}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)]"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[var(--muted)] border-[var(--border)]"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Color identificatorio</Label>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">
              Aparece en el chat, switcher y mensajes
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {COLORES.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`aspect-square rounded-xl transition-all cursor-pointer ${
                    color === c.hex
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070708] scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{ background: c.hex }}
                  title={c.nombre}
                  aria-label={c.nombre}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleGuardar}
              disabled={actualizar.isPending}
              className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer"
            >
              {actualizar.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
