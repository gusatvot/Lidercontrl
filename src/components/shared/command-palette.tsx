'use client'

import { Command as CommandPrimitive } from 'cmdk'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore, type Seccion } from '@/store/app'
import {
  LayoutDashboard,
  Home,
  ShoppingCart,
  Snowflake,
  PiggyBank,
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Settings,
  ChartColumn,
} from 'lucide-react'
import { MESES } from '@/lib/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COMANDOS: { id: string; label: string; hint: string; seccion?: Seccion; icon: any; accion?: string }[] = [
  { id: 'dash', label: 'Ir al Dashboard', hint: 'Vista general', seccion: 'dashboard', icon: LayoutDashboard },
  { id: 'ingresos', label: 'Ver Ingresos', hint: 'Sueldos y extras', seccion: 'ingresos', icon: TrendingUp },
  { id: 'fijos', label: 'Ver Gastos Fijos', hint: 'Alquiler, servicios...', seccion: 'gastos-fijos', icon: Home },
  { id: 'vars', label: 'Ver Gastos Diarios', hint: 'Comida, ocio...', seccion: 'gastos-variables', icon: ShoppingCart },
  { id: 'deudas', label: 'Pago de Deudas', hint: 'Método bola de nieve', seccion: 'deudas', icon: Snowflake },
  { id: 'ahorros', label: 'Ahorros', hint: 'Metas y progreso', seccion: 'ahorros', icon: PiggyBank },
  { id: 'reportes', label: 'Ver Reportes', hint: 'Análisis y gráficos', seccion: 'reportes', icon: ChartColumn },
  // Chat desactivado: ver nota en sidebar.tsx
  // { id: 'chat', label: 'Abrir Chat', hint: 'Mensajes y transferencias', seccion: 'chat', icon: MessageSquare },
  { id: 'ajustes', label: 'Abrir Ajustes', hint: 'Perfil, apariencia, familia', seccion: 'ajustes', icon: Settings },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { setSeccion, mesAnterior, mesSiguiente, abrirGastoDialog, abrirIngresoDialog } = useAppStore()

  const run = (cmd: typeof COMANDOS[number]) => {
    if (cmd.seccion) setSeccion(cmd.seccion)
    if (cmd.id === 'nuevo-gasto') abrirGastoDialog('variable')
    if (cmd.id === 'nuevo-fijo') abrirGastoDialog('fijo')
    if (cmd.id === 'nuevo-ingreso') abrirIngresoDialog()
    if (cmd.id === 'mes-prev') mesAnterior()
    if (cmd.id === 'mes-next') mesSiguiente()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-[var(--border)] p-0 max-w-xl overflow-hidden">
        <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
        <DialogDescription className="sr-only">
          Buscá comandos y navegación rápida. Usá las flechas para moverte y Enter para seleccionar.
        </DialogDescription>
        <CommandPrimitive
          className="rounded-2xl"
          loop
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted-foreground)]">Buscar comandos...</span>
          </div>
          <CommandPrimitive.Input
            placeholder="Escribí un comando o búsqueda..."
            className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
          <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
            <CommandPrimitive.Empty className="text-sm text-[var(--muted-foreground)] py-8 text-center">
              No se encontraron comandos
            </CommandPrimitive.Empty>

            <CommandPrimitive.Group heading="Navegación" className="text-xs text-[var(--muted-foreground)] px-2 pb-1 pt-2">
              {COMANDOS.map((cmd) => {
                const Icon = cmd.icon
                return (
                  <CommandPrimitive.Item
                    key={cmd.id}
                    onSelect={() => run(cmd)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--secondary)] data-[selected=true]:bg-[var(--secondary)] aria-selected:bg-[var(--secondary)] text-sm"
                  >
                    <Icon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="flex-1">{cmd.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{cmd.hint}</span>
                  </CommandPrimitive.Item>
                )
              })}
            </CommandPrimitive.Group>

            <CommandPrimitive.Group heading="Acciones rápidas" className="text-xs text-[var(--muted-foreground)] px-2 pb-1 pt-3">
              <CommandPrimitive.Item
                onSelect={() => run({ id: 'nuevo-gasto', label: '', hint: '', icon: Plus } as any)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--secondary)] text-sm"
              >
                <Plus className="w-4 h-4 text-[var(--chart-4)]" />
                <span className="flex-1">Nuevo gasto diario</span>
                <kbd className="text-[10px] text-[var(--muted-foreground)]">N</kbd>
              </CommandPrimitive.Item>
              <CommandPrimitive.Item
                onSelect={() => run({ id: 'nuevo-fijo', label: '', hint: '', icon: Plus } as any)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--secondary)] text-sm"
              >
                <Plus className="w-4 h-4 text-[var(--primary)]" />
                <span className="flex-1">Nuevo gasto fijo</span>
                <kbd className="text-[10px] text-[var(--muted-foreground)]">F</kbd>
              </CommandPrimitive.Item>
              <CommandPrimitive.Item
                onSelect={() => run({ id: 'nuevo-ingreso', label: '', hint: '', icon: TrendingUp } as any)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--secondary)] text-sm"
              >
                <TrendingUp className="w-4 h-4 text-[var(--chart-3)]" />
                <span className="flex-1">Nuevo ingreso</span>
                <kbd className="text-[10px] text-[var(--muted-foreground)]">I</kbd>
              </CommandPrimitive.Item>
              <CommandPrimitive.Item
                onSelect={() => run({ id: 'mes-prev', label: '', hint: '', icon: ChevronLeft } as any)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--secondary)] text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="flex-1">Mes anterior</span>
              </CommandPrimitive.Item>
              <CommandPrimitive.Item
                onSelect={() => run({ id: 'mes-next', label: '', hint: '', icon: ChevronRight } as any)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--secondary)] text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="flex-1">Mes siguiente</span>
              </CommandPrimitive.Item>
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}
