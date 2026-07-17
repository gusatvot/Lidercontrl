'use client'

import { useState } from 'react'
import { useCategorias, useCrearCategoria, useUpdateCategoria, useDeleteCategoria } from '@/hooks/use-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Tag, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

type TipoCategoria = 'gasto-fijo' | 'gasto-variable' | 'ingreso'

const COLORES_PREDEFINIDOS = [
  '#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b',
  '#06b6d4', '#ec4899', '#84cc16', '#ef4444', '#8b8b94',
]

const EMOJIS_PREDEFINIDOS = ['🏷️', '🏠', '🚗', '🍔', '🎬', '💼', '💰', '💳', '📱', '🛒', '⚡', '🧾', '🎁', '✈️', '💊', '🎓']

const TIPOS_INFO: { id: TipoCategoria; label: string; descripcion: string; color: string }[] = [
  { id: 'gasto-fijo', label: 'Gastos Fijos', descripcion: 'Alquiler, servicios, deudas', color: '#6366f1' },
  { id: 'gasto-variable', label: 'Gastos Diarios', descripcion: 'Comida, ocio, transporte', color: '#f59e0b' },
  { id: 'ingreso', label: 'Ingresos', descripcion: 'Sueldo, freelance, reembolsos', color: '#10b981' },
]

export function CategoriasTab() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoCategoria>('gasto-fijo')
  const [crearOpen, setCrearOpen] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)

  const { data: categorias, isLoading } = useCategorias(tipoSeleccionado)
  const crearCat = useCrearCategoria()
  const updateCat = useUpdateCategoria()
  const deleteCat = useDeleteCategoria()

  const categoriaEditando = (categorias || []).find((c: any) => c.id === editandoId)
  const categoriaEliminando = (categorias || []).find((c: any) => c.id === eliminandoId)

  return (
    <div className="space-y-6">
      {/* Selector de tipo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIPOS_INFO.map((tipo) => {
          const activo = tipoSeleccionado === tipo.id
          return (
            <button
              key={tipo.id}
              onClick={() => setTipoSeleccionado(tipo.id)}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                activo
                  ? 'bg-gradient-to-br from-[rgba(99,102,241,0.15)] to-[rgba(139,92,246,0.08)] border-[#6366f1]/40'
                  : 'glass border-[var(--border)] hover:border-[var(--border)]'
              }`}
              style={activo ? { borderColor: tipo.color + '60' } : {}}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: tipo.color, boxShadow: activo ? `0 0 8px ${tipo.color}` : 'none' }}
                />
                <span className="text-sm font-semibold">{tipo.label}</span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">{tipo.descripcion}</div>
            </button>
          )
        })}
      </div>

      {/* Botón crear */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Categorías de {TIPOS_INFO.find((t) => t.id === tipoSeleccionado)?.label}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {(categorias || []).length} categorías en total
          </p>
        </div>
        <Button
          onClick={() => setCrearOpen(true)}
          className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva categoría
        </Button>
      </div>

      {/* Lista de categorías */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl shimmer glass" />
          ))}
        </div>
      ) : (categorias || []).length === 0 ? (
        <div className="rounded-3xl p-12 glass text-center">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-40 text-[var(--muted-foreground)]" />
          <div className="text-sm text-[var(--muted-foreground)]">
            No tenés categorías personalizadas todavía. Creá la primera con el botón de arriba.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(categorias || []).map((cat: any, i: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-4 rounded-2xl glass border border-[var(--border)] hover:border-[var(--border)] transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: cat.color + '20' }}
              >
                {cat.icono || '🏷️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{cat.nombre}</span>
                  {cat.esDefault && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)]">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  {cat.color}
                </div>
              </div>
              {!cat.esDefault && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditandoId(cat.id)}
                    className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer transition-all"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEliminandoId(cat.id)}
                    className="p-2 rounded-lg hover:bg-[rgba(244,63,94,0.1)] text-[var(--muted-foreground)] hover:text-[var(--destructive)] cursor-pointer transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal crear */}
      <CategoriaFormDialog
        open={crearOpen}
        onOpenChange={setCrearOpen}
        tipo={tipoSeleccionado}
        onSubmit={async (data) => {
          await crearCat.mutateAsync({ ...data, tipo: tipoSeleccionado })
          setCrearOpen(false)
        }}
        isSubmitting={crearCat.isPending}
      />

      {/* Modal editar */}
      <CategoriaFormDialog
        open={!!categoriaEditando}
        onOpenChange={(o) => { if (!o) setEditandoId(null) }}
        tipo={tipoSeleccionado}
        categoriaInicial={categoriaEditando}
        onSubmit={async (data) => {
          if (!editandoId) return
          await updateCat.mutateAsync({ id: editandoId, data })
          setEditandoId(null)
        }}
        isSubmitting={updateCat.isPending}
      />

      {/* Dialog eliminar */}
      <AlertDialog open={!!categoriaEliminando} onOpenChange={(o) => { if (!o) setEliminandoId(null) }}>
        <AlertDialogContent className="glass-strong border-[var(--border)]">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{categoriaEliminando?.nombre}</strong>. Esta acción no se puede deshacer.
              <br />
              <br />
              Si hay movimientos usando esta categoría, vas a tener que cambiarles la categoría primero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!eliminandoId) return
                try {
                  await deleteCat.mutateAsync(eliminandoId)
                  setEliminandoId(null)
                } catch (e: any) {
                  toast.error(e.message)
                }
              }}
              className="bg-[var(--destructive)] hover:bg-[var(--destructive)]/80 cursor-pointer"
            >
              {deleteCat.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// =================== Form Dialog (crear/editar) ===================

interface CategoriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipo: TipoCategoria
  categoriaInicial?: any
  onSubmit: (data: { nombre: string; color: string; icono: string }) => Promise<void>
  isSubmitting: boolean
}

function CategoriaFormDialog({ open, onOpenChange, tipo, categoriaInicial, onSubmit, isSubmitting }: CategoriaFormDialogProps) {
  const [nombre, setNombre] = useState(categoriaInicial?.nombre || '')
  const [color, setColor] = useState(categoriaInicial?.color || '#6366f1')
  const [icono, setIcono] = useState(categoriaInicial?.icono || '🏷️')

  // Reset cuando cambia categoriaInicial
  useState(() => {
    if (categoriaInicial) {
      setNombre(categoriaInicial.nombre)
      setColor(categoriaInicial.color)
      setIcono(categoriaInicial.icono)
    }
  })

  const esEdicion = !!categoriaInicial

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    await onSubmit({ nombre: nombre.trim(), color, icono })
    if (!esEdicion) {
      setNombre('')
      setColor('#6366f1')
      setIcono('🏷️')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-[var(--border)] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[var(--primary)]" />
            {esEdicion ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modificá los datos de la categoría.'
              : `Creá una categoría personalizada para ${TIPOS_INFO.find((t) => t.id === tipo)?.label}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Preview */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: color + '20', border: `1px solid ${color}40` }}
            >
              {icono}
            </div>
            <div>
              <div className="font-semibold">{nombre || 'Nombre de la categoría'}</div>
              <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {color}
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Supermercado, Nafta..."
              className="bg-[var(--muted)] border-[var(--border)]"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORES_PREDEFINIDOS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg cursor-pointer transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--background)]' : 'hover:scale-110'
                  }`}
                  style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
                >
                  {color === c && <Check className="w-4 h-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icono */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Ícono (emoji)</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS_PREDEFINIDOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcono(e)}
                  className={`w-9 h-9 rounded-lg cursor-pointer transition-all text-lg flex items-center justify-center ${
                    icono === e
                      ? 'bg-[rgba(99,102,241,0.2)] ring-1 ring-[#6366f1]'
                      : 'bg-[var(--muted)] hover:bg-[var(--secondary)]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="cursor-pointer">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nombre.trim()}
              className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {esEdicion ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
