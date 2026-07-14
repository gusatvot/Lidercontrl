'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/store/app'
import { useCreateIngreso, useUpdateIngreso, useIngresos } from '@/hooks/use-data'
import { createIngresoSchema } from '@/lib/validations'
import { CATEGORIAS_INGRESO } from '@/lib/types'
import { Loader2, TrendingUp, Repeat, DollarSign, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

interface IngresoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editandoId?: string | null
}

export function IngresoDialog({ open, onOpenChange, editandoId }: IngresoDialogProps) {
  const { mes, anio } = useAppStore()
  const createIngreso = useCreateIngreso()
  const updateIngreso = useUpdateIngreso()
  const { data: ingresos } = useIngresos()
  const [internalEditandoId, setInternalEditandoId] = useState<string | null>(null)

  const editId = editandoId || internalEditandoId

  const form = useForm<any>({
    resolver: zodResolver(createIngresoSchema),
    defaultValues: {
      concepto: '',
      categoria: '',
      monto: undefined,
      esFijo: false,
      nota: '',
      mes,
      anio,
    },
  })

  useEffect(() => {
    if (open && editId) {
      const ingreso = (ingresos || []).find((i: any) => i.id === editId)
      if (ingreso) {
        form.reset({
          concepto: ingreso.concepto,
          categoria: ingreso.categoria,
          monto: ingreso.monto,
          esFijo: ingreso.esFijo,
          nota: ingreso.nota || '',
          mes,
          anio,
        })
      }
    } else if (open) {
      Promise.resolve().then(() => {
        form.reset({
          concepto: '',
          categoria: '',
          monto: undefined,
          esFijo: false,
          nota: '',
          mes,
          anio,
        })
        setInternalEditandoId(null)
      })
    }
  }, [open, editId, ingresos, form, mes, anio])

  const onSubmit = async (values: any, continuar = false) => {
    try {
      if (editId) {
        await updateIngreso.mutateAsync({ id: editId, data: values })
      } else {
        await createIngreso.mutateAsync(values)
      }

      if (continuar) {
        // Resetear TODO el form para cargar otro ingreso desde cero
        Promise.resolve().then(() => {
          form.reset({
            concepto: '',
            categoria: '',
            monto: '' as any,
            esFijo: false,
            nota: '',
            mes,
            anio,
          })
        })
      } else {
        onOpenChange(false)
      }
    } catch (e) {
      // toast lo maneja el hook
    }
  }

  // Wrapper compatible con SubmitHandler<T> de React Hook Form.
  const handleSubmit = (values: any) => onSubmit(values, false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--popover)] border-[var(--border)] max-w-md p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(52,211,153,0.04)] border-b border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <TrendingUp className="w-4 h-4 text-[var(--foreground)]" />
              </div>
              <div>
                <div>{editId ? 'Editar' : 'Nuevo'} Ingreso</div>
                <div className="text-xs text-[var(--muted-foreground)] font-normal mt-0.5">
                  {editId ? 'Modificá los datos del ingreso' : 'Registrá un nuevo ingreso'}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editId ? 'Editá los datos del ingreso.' : 'Registrá un nuevo ingreso para el mes en curso.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="px-6 py-5 space-y-5">
            {/* Concepto */}
            <div className="space-y-1.5">
              <Label htmlFor="ing-concepto" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Concepto</Label>
              <div className="relative">
                <TrendingUp className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  id="ing-concepto"
                  placeholder="Ej: Sueldo, Freelance..."
                  className="bg-[var(--muted)] border-[var(--border)] pl-10 h-11"
                  {...form.register('concepto')}
                />
              </div>
              {form.formState.errors.concepto && (
                <p className="text-xs text-[var(--destructive)]">{form.formState.errors.concepto.message as string}</p>
              )}
            </div>

            {/* Categoría + Monto en grilla */}
            <div className="grid grid-cols-2 gap-4">
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
                    {CATEGORIAS_INGRESO.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoria && (
                  <p className="text-xs text-[var(--destructive)]">{form.formState.errors.categoria.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ing-monto" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Monto</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    id="ing-monto"
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
            </div>

            {/* Checkbox fijo */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <Checkbox
                id="ing-esFijo"
                onCheckedChange={(v) => form.setValue('esFijo', v === true)}
                defaultChecked={false}
              />
              <div className="flex-1">
                <Label htmlFor="ing-esFijo" className="cursor-pointer text-sm font-medium">
                  Ingreso fijo mensual
                </Label>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Marcá si es recurrente (sueldo, alquiler recibido, etc.)
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="ing-nota" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Descripción (opcional)</Label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-[var(--muted-foreground)]" />
                <Textarea
                  id="ing-nota"
                  rows={3}
                  placeholder="Agregá una descripción o detalle del ingreso..."
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
                onClick={() => onOpenChange(false)}
                className="cursor-pointer flex-1 h-10 text-sm"
              >
                Cancelar
              </Button>
              {!editId && (
                <Button
                  type="button"
                  disabled={createIngreso.isPending || updateIngreso.isPending}
                  onClick={() => form.handleSubmit((v) => onSubmit(v, true))()}
                  className="bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] cursor-pointer flex-1 h-10 text-sm"
                >
                  {(createIngreso.isPending || updateIngreso.isPending) ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Repeat className="w-4 h-4 mr-1.5" />}
                  Continuar
                </Button>
              )}
              <Button
                type="submit"
                disabled={createIngreso.isPending || updateIngreso.isPending}
                className="bg-gradient-to-br from-[#10b981] to-[#34d399] hover:from-[#10b981]/80 hover:to-[#34d399]/80 cursor-pointer flex-1 h-10 text-sm font-semibold"
              >
                {(createIngreso.isPending || updateIngreso.isPending) && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {editId ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
