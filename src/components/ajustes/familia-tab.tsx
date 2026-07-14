'use client'

import { useState } from 'react'
import { useUsuarios, useCrearUsuario, useEliminarUsuario, useSetUsuarioActivo } from '@/hooks/use-data'
import { useAppStore } from '@/store/app'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Trash2, Mail, Loader2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'

const COLORES = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']

export function FamiliaTab() {
  const { data: usuarios, isLoading } = useUsuarios()
  const crear = useCrearUsuario()
  const eliminar = useEliminarUsuario()
  const setUsuario = useSetUsuarioActivo()
  const { usuarioActivoId } = useAppStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [nuevoColor, setNuevoColor] = useState(COLORES[0])

  const handleCrear = async () => {
    if (!nuevoNombre.trim() || !nuevoEmail.trim()) {
      toast.error('Completá nombre y email')
      return
    }
    try {
      await crear.mutateAsync({
        nombre: nuevoNombre.trim(),
        email: nuevoEmail.trim(),
        color: nuevoColor,
      })
      setNuevoNombre('')
      setNuevoEmail('')
      setNuevoColor(COLORES[0])
      setDialogOpen(false)
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--chart-2)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Miembros de la familia</h2>
              <p className="text-xs text-[var(--muted-foreground)]">{(usuarios || []).length} miembros registrados</p>
            </div>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar miembro
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[var(--muted)] shimmer" />
            ))}
          </div>
        ) : (usuarios || []).length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No hay miembros registrados
          </div>
        ) : (
          <div className="space-y-2">
            {(usuarios || []).map((u: any, i: number) => {
              const esActivo = u.id === usuarioActivoId
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-[var(--secondary)] transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                    style={{ background: `${u.color}25`, color: u.color }}
                  >
                    {u.nombre.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{u.nombre}</span>
                      {esActivo && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(99,102,241,0.15)] text-[var(--primary)] text-[0.65rem] font-semibold">
                          <Crown className="w-2.5 h-2.5" />
                          Vos
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    {u.creadoEn && (
                      <div className="text-[0.65rem] text-[var(--muted-foreground)] mt-0.5">
                        Miembro desde {formatDate(u.creadoEn)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!esActivo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUsuario.mutate(u.id)}
                        className="cursor-pointer text-xs h-8"
                      >
                        Cambiar a
                      </Button>
                    )}
                    {!esActivo && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-2 rounded-lg hover:bg-[rgba(244,63,94,0.15)] hover:text-[var(--destructive)] cursor-pointer transition-all"
                            title="Eliminar miembro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong border-[var(--border)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar a {u.nombre}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminarán todos sus datos: gastos, ingresos, mensajes y transferencias.
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminar.mutate(u.id)}
                              className="bg-[#f43f5e] hover:bg-[#f43f5e]/80 cursor-pointer"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal crear */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-[var(--border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[var(--primary)]" />
              Nuevo miembro de la familia
            </DialogTitle>
            <DialogDescription className="sr-only">
              Agregá un nuevo miembro. Podrás cambiar a este usuario desde el switcher.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nuevo-nombre">Nombre</Label>
              <Input
                id="nuevo-nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="bg-[var(--muted)] border-[var(--border)]"
                placeholder="Ej: Mamá, Seba, Tío Jorge..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nuevo-email">Email</Label>
              <Input
                id="nuevo-email"
                type="email"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                className="bg-[var(--muted)] border-[var(--border)]"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Color identificatorio</Label>
              <div className="flex flex-wrap gap-2">
                {COLORES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNuevoColor(c)}
                    className={`w-9 h-9 rounded-lg transition-all cursor-pointer ${
                      nuevoColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070708] scale-110' : 'hover:scale-105'
                    }`}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              onClick={handleCrear}
              disabled={crear.isPending}
              className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer"
            >
              {crear.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
