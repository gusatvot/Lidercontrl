'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/store/app'
import {
  useCreateGastoFijo,
  useUpdateGastoFijo,
  useCreateGastoVariable,
  useUpdateGastoVariable,
  useGastosFijos,
  useGastosVariables,
  useCategorias,
} from '@/hooks/use-data'
import {
  createGastoFijoSchema,
  createGastoVariableSchema,
} from '@/lib/validations'
import { Loader2, Repeat, Wallet, Tag, DollarSign, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface GastoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GastoDialog({ open, onOpenChange }: GastoDialogProps) {
  const { gastoTipo, gastoEditandoId, mes, anio, cerrarGastoDialog } = useAppStore()
  const createFijo = useCreateGastoFijo()
  const updateFijo = useUpdateGastoFijo()
  const createVariable = useCreateGastoVariable()
  const updateVariable = useUpdateGastoVariable()

  const { data: gastosFijos } = useGastosFijos()
  const { data: gastosVariables } = useGastosVariables()

  const categoriasTipo = gastoTipo === 'fijo' ? 'gasto-fijo' as const : 'gasto-variable' as const
  const { data: categoriasData } = useCategorias(categoriasTipo)
  const categorias = (categoriasData || []).map((c: any) => c.nombre)

  const form = useForm<any>({
    resolver: zodResolver(gastoTipo === 'fijo' ? createGastoFijoSchema : createGastoVariableSchema),
    defaultValues: {
      concepto: '',
      categoria: '',
      monto: undefined,
      fecha: new Date().toISOString().slice(0, 10),
      fechaVencimiento: new Date().toISOString().slice(0, 10),
      diaVencimiento: new Date().getDate(),
      estado: 'pendiente',
      nota: '',
      mes,
      anio,
    },
  })

  // Cargar datos si estamos editando
  useEffect(() => {
    if (open && gastoEditandoId) {
      // Buscar en gastos fijos primero
      let gasto: any = (gastosFijos || []).find((g: any) => g.id === gastoEditandoId)
      if (!gasto) {
        // Si no está, buscar en gastos variables
        gasto = (gastosVariables || []).find((g: any) => g.id === gastoEditandoId)
      }
      if (gasto) {
        form.reset({
          concepto: gasto.concepto,
          categoria: gasto.categoria,
          monto: gasto.monto,
          fecha: gasto.fecha ? new Date(gasto.fecha).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          fechaVencimiento: gasto.diaVencimiento
            ? new Date(gasto.anio, gasto.mes - 1, gasto.diaVencimiento).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          diaVencimiento: gasto.diaVencimiento || new Date().getDate(),
          estado: gasto.estado || 'pendiente',
          nota: gasto.nota || '',
          mes,
          anio,
        })
      }
    } else if (open) {
      form.reset({
        concepto: '',
        categoria: '',
        monto: undefined,
        fecha: new Date().toISOString().slice(0, 10),
        fechaVencimiento: new Date().toISOString().slice(0, 10),
        diaVencimiento: new Date().getDate(),
        estado: 'pendiente',
        nota: '',
        mes,
        anio,
      })
    }
  }, [open, gastoEditandoId, gastosFijos, gastosVariables, form, mes, anio])

  const onSubmit = async (values: any, continuar = false) => {
    try {
      if (gastoTipo === 'fijo') {
        if (gastoEditandoId) {
          await updateFijo.mutateAsync({ id: gastoEditandoId, data: values })
        } else {
          await createFijo.mutateAsync({ ...values, mes, anio })
        }
      } else {
        // Gasto variable
        const dataVar = {
          concepto: values.concepto,
          categoria: values.categoria,
          monto: values.monto,
        }
        if (gastoEditandoId) {
          await updateVariable.mutateAsync({ id: gastoEditandoId, data: dataVar })
        } else {
          await createVariable.mutateAsync({ ...dataVar, mes, anio })
        }
      }

      if (continuar) {
        // Resetear TODO el form para cargar otro gasto desde cero
        form.reset({
          concepto: '',
          categoria: '',
          monto: '' as any,
          fecha: new Date().toISOString().slice(0, 10),
          fechaVencimiento: new Date().toISOString().slice(0, 10),
          diaVencimiento: new Date().getDate(),
          estado: 'pendiente',
          nota: '',
          mes,
          anio,
        })
      } else {
        cerrarGastoDialog()
        onOpenChange(false)
      }
    } catch (e) {
      // el toast de error lo maneja el hook
    }
  }

  // Wrapper compatible con SubmitHandler<T> de React Hook Form.
  const handleSubmit = (values: any) => onSubmit(values, false)

  const isSubmitting = createFijo.isPending || updateFijo.isPending || createVariable.isPending || updateVariable.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) cerrarGastoDialog(); onOpenChange(o) }}>
      <DialogContent className="bg-[var(--popover)] border-[var(--border)] max-w-md p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-[rgba(99,102,241,0.08)] to-[rgba(139,92,246,0.04)] border-b border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Wallet className="w-4 h-4 text-[var(--foreground)]" />
              </div>
              <div>
                <div>{gastoEditandoId ? 'Editar' : 'Nuevo'}{' '}
                  {gastoTipo === 'fijo' ? 'Gasto Fijo' : 'Gasto Diario'}</div>
                <div className="text-xs text-[var(--muted-foreground)] font-normal mt-0.5">
                  {gastoEditandoId ? 'Modificá los datos del gasto' : 'Cargá los datos del nuevo gasto'}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Completá los datos del gasto y guardá los cambios.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="px-6 py-5 space-y-5">
            {/* Concepto */}
            <div className="space-y-1.5">
              <Label htmlFor="concepto" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Concepto</Label>
              <div className="relative">
                <Wallet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  id="concepto"
                  placeholder="Ej: Supermercado, Café..."
                  className="bg-[var(--muted)] border-[var(--border)] pl-10 h-11"
                  {...form.register('concepto')}
                />
              </div>
              {form.formState.errors.concepto && (
                <p className="text-xs text-[var(--destructive)]">{form.formState.errors.concepto.message as string}</p>
              )}
            </div>

            {/* Categoría + Monto en grilla (gasto diario) / Categoría sola (gasto fijo) */}
            <div className={gastoTipo === 'fijo' ? 'space-y-1.5' : 'grid grid-cols-2 gap-4'}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Categoría</Label>
                <Select
                  onValueChange={(v) => form.setValue('categoria', v, { shouldValidate: true })}
                  defaultValue={form.getValues('categoria') as string}
                >
                  <SelectTrigger className="bg-[var(--muted)] border-[var(--border)] h-11">
                    <SelectValue placeholder="Elegir..." />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-[var(--border)]">
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoria && (
                  <p className="text-xs text-[var(--destructive)]">{form.formState.errors.categoria.message as string}</p>
                )}
              </div>

              {/* Monto */}
              {gastoTipo !== 'fijo' && (
                <div className="space-y-1.5">
                  <Label htmlFor="monto" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Monto</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="bg-[var(--muted)] border-[var(--border)] pl-10 h-11 tabular"
                      {...form.register('monto', { valueAsNumber: true })}
                    />
                  </div>
                  {form.formState.errors.monto && (
                    <p className="text-xs text-[var(--destructive)]">{form.formState.errors.monto.message as string}</p>
                  )}
                </div>
              )}
            </div>

            {/* Monto para gasto fijo (ancho completo) */}
            {gastoTipo === 'fijo' && (
              <div className="space-y-1.5">
                <Label htmlFor="monto" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Monto (ARS)</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className="bg-[var(--muted)] border-[var(--border)] pl-10 h-11 tabular"
                    {...form.register('monto', { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.monto && (
                  <p className="text-xs text-[var(--destructive)]">{form.formState.errors.monto.message as string}</p>
                )}
              </div>
            )}

            {/* Gasto fijo: fecha de vencimiento + estado */}
            {gastoTipo === 'fijo' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fechaVencimiento" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Fecha de vencimiento</Label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="fechaVencimiento"
                      type="date"
                      className="bg-[var(--muted)] border-[var(--border)] pl-10 h-11"
                      {...form.register('fechaVencimiento')}
                      onChange={(e) => {
                        form.setValue('fechaVencimiento', e.target.value)
                        // Auto-calcular dia/mes/anio desde la fecha
                        if (e.target.value) {
                          const fecha = new Date(e.target.value)
                          form.setValue('diaVencimiento', fecha.getDate(), { shouldValidate: false })
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Estado</Label>
                  <Select
                    onValueChange={(v) => form.setValue('estado', v)}
                    defaultValue={form.getValues('estado') as string || 'pendiente'}
                  >
                    <SelectTrigger className="bg-[var(--muted)] border-[var(--border)] h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-[var(--border)]">
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Descripción (para todos los tipos) */}
            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Descripción (opcional)</Label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-[var(--muted-foreground)]" />
                <Textarea
                  id="descripcion"
                  rows={3}
                  placeholder="Agregá una descripción o detalle del gasto..."
                  className="bg-[var(--muted)] border-[var(--border)] pl-10 resize-none"
                  {...form.register('nota')}
                />
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { cerrarGastoDialog(); onOpenChange(false) }}
                className="cursor-pointer flex-1 h-10 text-sm"
              >
                Cancelar
              </Button>
              {!gastoEditandoId && (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => form.handleSubmit((v) => onSubmit(v, true))()}
                  className="bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] cursor-pointer flex-1 h-10 text-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Repeat className="w-4 h-4 mr-1.5" />}
                  Continuar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] hover:from-[var(--primary)]/80 hover:to-[var(--chart-2)]/80 cursor-pointer flex-1 h-10 text-sm font-semibold"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {gastoEditandoId ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
  