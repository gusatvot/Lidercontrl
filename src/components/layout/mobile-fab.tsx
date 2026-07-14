'use client'

import { useAppStore } from '@/store/app'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function MobileFAB() {
  const { seccion, abrirGastoDialog, abrirIngresoDialog } = useAppStore()

  // No mostrar FAB en chat ni ajustes
  if (seccion === 'chat' || seccion === 'ajustes') return null

  const handleClick = () => {
    if (seccion === 'ingresos') {
      abrirIngresoDialog()
    } else {
      // En dashboard, gastos, reportes, deudas, ahorros → gasto diario (variable)
      abrirGastoDialog('variable')
    }
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.5)] md:hidden cursor-pointer"
      aria-label="Agregar"
    >
      <Plus className="w-7 h-7 text-[var(--foreground)]" strokeWidth={2.5} />
    </motion.button>
  )
}
