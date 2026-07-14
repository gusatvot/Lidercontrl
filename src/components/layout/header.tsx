'use client'

import { useAppStore } from '@/store/app'
import { MESES } from '@/lib/types'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeaderProps {
  onAgregarGasto: () => void
  onAbrirCmdk?: () => void
}

export function Header({ onAgregarGasto }: HeaderProps) {
  const { seccion, mes, anio, mesAnterior, mesSiguiente, abrirIngresoDialog, abrirGastoDialog } = useAppStore()

  const titulos: Record<string, { titulo: string; sub: string }> = {
    dashboard: { titulo: 'Resumen', sub: `${MESES[mes - 1]} ${anio}` },
    ingresos: { titulo: 'Ingresos', sub: `${MESES[mes - 1]} ${anio}` },
    'gastos-fijos': { titulo: 'Gastos Fijos', sub: `${MESES[mes - 1]} ${anio}` },
    'gastos-variables': { titulo: 'Gastos Diarios', sub: `${MESES[mes - 1]} ${anio}` },
    deudas: { titulo: 'Pago de Deudas', sub: 'Método Bola de Nieve' },
    ahorros: { titulo: 'Ahorros', sub: 'Metas y progreso' },
    reportes: { titulo: 'Reportes', sub: `${MESES[mes - 1]} ${anio}` },
    chat: { titulo: 'Chat Familiar', sub: 'Mensajes y transferencias' },
    ajustes: { titulo: 'Ajustes', sub: 'Personaliza tu experiencia' },
  }

  const { titulo, sub } = titulos[seccion]

  // El botón del header solo aparece en Dashboard.
  // En Ingresos, Gastos Fijos y Gastos Diarios, cada sección tiene su propio botón.
  const esSeccionIngresos = seccion === 'ingresos'
  const esSeccionDashboard = seccion === 'dashboard'
  const mostrarBotonAccion = esSeccionDashboard
  const mostrarSelectorMes = seccion !== 'chat' && seccion !== 'ajustes' && seccion !== 'deudas' && seccion !== 'ahorros' && seccion !== 'reportes'

  const handleAgregar = () => {
    if (esSeccionIngresos) {
      abrirIngresoDialog()
    } else {
      // En el dashboard, el botón agrega gastos diarios (variables)
      abrirGastoDialog('variable')
    }
  }

  return (
    <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div>
          <motion.h1
            key={titulo}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2rem] font-bold tracking-tight"
          >
            {titulo}{' '}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--chart-2)] bg-clip-text text-transparent">
              {sub}
            </span>
          </motion.h1>
        </div>

        {/* Selector de mes (solo en secciones financieras) */}
        {mostrarSelectorMes && (
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            <button
              onClick={mesAnterior}
              className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-3 tabular min-w-[120px] text-center">
              {MESES[mes - 1]} {anio}
            </span>
            <button
              onClick={mesSiguiente}
              className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center">
        {mostrarBotonAccion && (
          <button
            onClick={handleAgregar}
            className={`px-5 py-2.5 rounded-xl text-[var(--foreground)] text-sm font-semibold border-none cursor-pointer flex items-center gap-2 transition-all hover:-translate-y-0.5 ${
              esSeccionIngresos
                ? 'bg-gradient-to-br from-[#10b981] to-[#34d399] shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.6)]'
                : 'bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.6)]'
            }`}
          >
            <Plus className="w-4 h-4" />
            {esSeccionIngresos ? 'Agregar Ingreso' : 'Agregar Gasto Diario'}
          </button>
        )}
      </div>
    </header>
  )
}
