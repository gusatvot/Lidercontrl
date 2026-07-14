// LiderControl - Utilidades de formato y cálculo financiero

// Tipo de formato
type FormatoMoneda = 'completo' | 'compacto' | 'decimales'

// Función para actualizar el formato en localStorage
export function setFormatoMonedaGlobal(formato: FormatoMoneda) {
  try {
    const stored = localStorage.getItem('wintexveo-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (!parsed.state) parsed.state = {}
      if (!parsed.state.apariencia) parsed.state.apariencia = {}
      parsed.state.apariencia.formatoMoneda = formato
      localStorage.setItem('wintexveo-storage', JSON.stringify(parsed))
    }
  } catch {}
}

// Formatear moneda
// - formato: si se pasa, usa ese formato. Si no, lee de localStorage.
export function formatCurrency(amount: number, compactOrFormato?: boolean | FormatoMoneda): string {
  // Determinar el formato a usar
  let formato: FormatoMoneda

  if (typeof compactOrFormato === 'string') {
    // Se pasó un formato explícito
    formato = compactOrFormato
  } else if (typeof compactOrFormato === 'boolean' && compactOrFormato === true) {
    // Se pasó compact=true (tickFormatter de gráficos)
    formato = 'compacto'
  } else {
    // Leer de localStorage
    formato = 'completo'
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wintexveo-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          const f = parsed?.state?.apariencia?.formatoMoneda
          if (f === 'completo' || f === 'compacto' || f === 'decimales') {
            formato = f
          }
        }
      } catch {}
    }
  }

  // Aplicar formato
  const usarCompacto = formato === 'compacto'
  const usarDecimales = formato === 'decimales'

  if (usarCompacto && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`
  }
  if (usarCompacto && Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }

  if (usarDecimales) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR').format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} · ${formatTime(date)}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export interface Distribucion5030 {
  necesidades: { monto: number; porcentaje: number }
  deseos: { monto: number; porcentaje: number }
  ahorros: { monto: number; porcentaje: number }
  // Real:
  realNecesidades: number // gastos fijos
  realDeseos: number // gastos variables
  realAhorros: number // monto ahorrado
}

/**
 * Calcula la distribución 50/30/20 sobre los ingresos.
 * - Necesidades (50%): gastos fijos
 * - Deseos (30%): gastos variables
 * - Ahorros (20%): meta de ahorro
 */
export function calcular5030(ingreso: number, gastosFijos: number, gastosVariables: number, ahorros: number): Distribucion5030 {
  return {
    necesidades: { monto: ingreso * 0.5, porcentaje: 50 },
    deseos: { monto: ingreso * 0.3, porcentaje: 30 },
    ahorros: { monto: ingreso * 0.2, porcentaje: 20 },
    realNecesidades: gastosFijos,
    realDeseos: gastosVariables,
    realAhorros: ahorros,
  }
}

export function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getMesAnioActual(): { mes: number; anio: number } {
  const now = new Date()
  return { mes: now.getMonth() + 1, anio: now.getFullYear() }
}

export function getMesesAnteriores(cantidad: number): { mes: number; anio: number }[] {
  const result: { mes: number; anio: number }[] = []
  const now = new Date()
  for (let i = 0; i < cantidad; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ mes: d.getMonth() + 1, anio: d.getFullYear() })
  }
  return result
}
