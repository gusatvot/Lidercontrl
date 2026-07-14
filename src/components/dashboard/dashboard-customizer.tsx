'use client'

import { useAppStore, type WidgetConfig, type WidgetId } from '@/store/app'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { GripVertical, RotateCcw, Eye, EyeOff } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const WIDGET_LABELS: Record<WidgetId, { nombre: string; descripcion: string; icon: string }> = {
  bento: { nombre: 'Tarjetas Bento', descripcion: 'Resumen de ingresos, gastos, ahorros y variables', icon: '📊' },
  insights: { nombre: 'Insights', descripcion: 'Análisis automático y alertas inteligentes', icon: '💡' },
  dona: { nombre: 'Distribución 50/30/20', descripcion: 'Gráfico de dona con la regla financiera', icon: '🍩' },
  gastosVariables: { nombre: 'Movimientos del mes', descripcion: 'Últimos movimientos del mes (ingresos y gastos)', icon: '📋' },
  saldo: { nombre: 'Saldo Disponible', descripcion: 'Card con saldo, ingresos y gastos del mes', icon: '💰' },
  metas: { nombre: 'Metas de Ahorro', descripcion: 'Progreso de tus metas de ahorro', icon: '🐷' },
}

function SortableWidget({ widget }: { widget: WidgetConfig }) {
  const { toggleWidget } = useAppStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id })
  const info = WIDGET_LABELS[widget.id]

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl glass border border-[var(--border)] transition-all',
        isDragging && 'opacity-50 shadow-2xl scale-105 border-[#6366f1]/40',
        !widget.visible && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Icon + info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.icon}</span>
          <span className="text-sm font-semibold">{info.nombre}</span>
          {!widget.visible && (
            <span className="text-[0.6rem] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded-md bg-[var(--secondary)]">
              Oculto
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{info.descripcion}</div>
      </div>

      {/* Toggle visible */}
      <Switch
        checked={widget.visible}
        onCheckedChange={() => toggleWidget(widget.id)}
        className={widget.visible ? 'bg-[#6366f1]' : 'bg-white/10'}
      />
    </div>
  )
}

export function DashboardCustomizer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { widgets, reorderWidgets, resetWidgets } = useAppStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id)
      const newIndex = widgets.findIndex((w) => w.id === over.id)
      const newWidgets = arrayMove(widgets, oldIndex, newIndex).map((w, i) => ({ ...w, orden: i }))
      reorderWidgets(newWidgets)
    }
  }

  const visiblesCount = widgets.filter((w) => w.visible).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-[var(--border)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎨 Personalizar Dashboard
          </DialogTitle>
          <DialogDescription>
            Arrastrá los widgets para reordenarlos. Activá o desactivá los que quieras ver.
            ({visiblesCount} de {widgets.length} visibles)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[450px] overflow-y-auto py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
              {widgets.map((widget) => (
                <SortableWidget key={widget.id} widget={widget} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => resetWidgets()}
            className="cursor-pointer text-[var(--muted-foreground)]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Restablecer
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer"
          >
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
