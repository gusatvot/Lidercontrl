'use client'

import { useExportarDatos, useEliminarTodosLosDatos } from '@/hooks/use-data'
import { motion } from 'framer-motion'
import { Database, Download, Upload, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export function DatosTab() {
  const exportar = useExportarDatos()
  const eliminar = useEliminarTodosLosDatos()

  return (
    <div className="space-y-5">
      {/* Exportar */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <Download className="w-5 h-5 text-[var(--chart-3)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Exportar datos</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Descargá tus datos en formato CSV</p>
          </div>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Exportá todos tus ingresos, gastos fijos, gastos variables, metas de ahorro y transferencias
          en un archivo CSV listo para abrir en Excel, Google Sheets o Numbers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-xl glass text-center">
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Ingresos</div>
            <div className="text-sm font-semibold">✓ Incluido</div>
          </div>
          <div className="p-3 rounded-xl glass text-center">
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Gastos fijos</div>
            <div className="text-sm font-semibold">✓ Incluido</div>
          </div>
          <div className="p-3 rounded-xl glass text-center">
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Gastos variables</div>
            <div className="text-sm font-semibold">✓ Incluido</div>
          </div>
          <div className="p-3 rounded-xl glass text-center">
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Transferencias</div>
            <div className="text-sm font-semibold">✓ Incluido</div>
          </div>
        </div>

        <Button
          onClick={() => exportar.mutate()}
          disabled={exportar.isPending}
          className="bg-gradient-to-br from-[#10b981] to-[#34d399] hover:from-[#10b981]/80 hover:to-[#34d399]/80 cursor-pointer"
        >
          {exportar.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Exportar a CSV
        </Button>
      </div>

      {/* Importar (placeholder) */}
      <div className="rounded-3xl p-6 glass opacity-60">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
            <Upload className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Importar datos</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Migrá desde otra app (próximamente)</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Próximamente vas a poder importar datos desde un CSV o desde apps como Mercado Pago, Money Lover o YNAB.
        </p>
      </div>

      {/* Eliminar datos */}
      <div className="rounded-3xl p-6 glass border-[rgba(244,63,94,0.15)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(244,63,94,0.15)] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[var(--destructive)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--destructive)]">Zona peligrosa</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Acciones que no se pueden deshacer</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.15)] mb-4">
          <div className="flex items-start gap-3">
            <Trash2 className="w-4 h-4 text-[var(--destructive)] mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold mb-1">Eliminar todos tus datos</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Borra todos tus ingresos, gastos, metas, mensajes y transferencias. Tu cuenta de usuario y saldo se reinician a cero.
                Tu perfil no se elimina.
              </div>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-[#f43f5e]/40 text-[var(--destructive)] hover:bg-[#f43f5e]/10 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar todos mis datos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-[var(--border)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--destructive)]">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción <strong>elimina permanentemente</strong> todos tus datos financieros,
                mensajes y transferencias. No se puede deshacer.
                <br /><br />
                Te recomendamos <strong>exportar tus datos a CSV primero</strong> antes de continuar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => eliminar.mutate()}
                className="bg-[#f43f5e] hover:bg-[#f43f5e]/80 cursor-pointer"
              >
                Sí, eliminar todo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
