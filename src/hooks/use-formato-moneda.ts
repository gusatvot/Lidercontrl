// Hook para obtener el formato de moneda del store
// y forzar re-render cuando cambia
import { useAppStore } from '@/store/app'
import type { FormatoMoneda } from '@/store/app'

export function useFormatoMoneda(): FormatoMoneda {
  return useAppStore((s) => s.apariencia.formatoMoneda)
}
