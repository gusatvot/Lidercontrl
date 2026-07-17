'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Seccion =
  | 'dashboard'
  | 'ingresos'
  | 'gastos-fijos'
  | 'gastos-variables'
  | 'deudas'
  | 'ahorros'
  | 'reportes'
  | 'chat'
  | 'ajustes'

export type Tema = 'oscuro-premium' | 'claro-minimalista' | 'neon-futurista'
export type ColorAcento = 'indigo' | 'violeta' | 'esmeralda' | 'rosa' | 'ambar'
export type Densidad = 'comoda' | 'compacta'
export type FormatoMoneda = 'completo' | 'compacto' | 'decimales'
export type Moneda = 'ARS' | 'USD' | 'BRL' | 'MXN' | 'EUR'

export interface PreferenciasNotificaciones {
  vencimientos: boolean
  transferencias: boolean
  mensajes: boolean
  metas: boolean
  excesoPresupuesto: boolean
  sonido: boolean
}

export interface PreferenciasApariencia {
  tema: Tema
  colorAcento: ColorAcento
  densidad: Densidad
  formatoMoneda: FormatoMoneda
  moneda: Moneda
}

export interface PreferenciasFinanzas {
  diaCorte: number // 1-28
  reglaNecesidades: number // %
  reglaDeseos: number // %
  reglaAhorros: number // %
  recordatorioDias: number // días antes del vencimiento
}

export type WidgetId =
  | 'bento'
  | 'insights'
  | 'dona'
  | 'gastosVariables'
  | 'saldo'
  | 'metas'

export interface WidgetConfig {
  id: WidgetId
  visible: boolean
  orden: number
}

interface AppState {
  // Navegación
  seccion: Seccion
  setSeccion: (s: Seccion) => void

  // Mes seleccionado
  mes: number
  anio: number
  setMesAnio: (mes: number, anio: number) => void
  mesAnterior: () => void
  mesSiguiente: () => void
  initMesActual: () => void

  // Usuario activo (mock)
  usuarioActivoId: string | null
  usuarioActivoNombre: string
  usuarioActivoColor: string
  setUsuarioActivo: (u: { id: string; nombre: string; color: string }) => void

  // Chat - contacto seleccionado
  contactoActivoId: string | null
  setContactoActivo: (id: string | null) => void

  // Modales
  gastoDialogOpen: boolean
  gastoEditandoId: string | null
  gastoTipo: 'fijo' | 'variable'
  abrirGastoDialog: (tipo: 'fijo' | 'variable', editandoId?: string | null) => void
  cerrarGastoDialog: () => void

  ingresoDialogOpen: boolean
  abrirIngresoDialog: () => void
  cerrarIngresoDialog: () => void

  cmdkOpen: boolean
  setCmdkOpen: (open: boolean) => void

  // Preferencias
  apariencia: PreferenciasApariencia
  notificaciones: PreferenciasNotificaciones
  finanzas: PreferenciasFinanzas
  widgets: WidgetConfig[]
  setApariencia: (a: Partial<PreferenciasApariencia>) => void
  setNotificaciones: (n: Partial<PreferenciasNotificaciones>) => void
  setFinanzas: (f: Partial<PreferenciasFinanzas>) => void
  toggleWidget: (id: WidgetId) => void
  reorderWidgets: (widgets: WidgetConfig[]) => void
  resetWidgets: () => void

  // Hydration flag
  _hydrated: boolean
  setHydrated: () => void
}

export const COLORES_ACCENTO: Record<ColorAcento, { primario: string; secundario: string; nombre: string }> = {
  indigo: { primario: '#6366f1', secundario: '#8b5cf6', nombre: 'Índigo' },
  violeta: { primario: '#8b5cf6', secundario: '#a78bfa', nombre: 'Violeta' },
  esmeralda: { primario: '#10b981', secundario: '#34d399', nombre: 'Esmeralda' },
  rosa: { primario: '#f43f5e', secundario: '#fb7185', nombre: 'Rosa' },
  ambar: { primario: '#f59e0b', secundario: '#fbbf24', nombre: 'Ámbar' },
}

export const MONEDAS_INFO: Record<Moneda, { simbolo: string; nombre: string; locale: string }> = {
  ARS: { simbolo: '$', nombre: 'Peso Argentino', locale: 'es-AR' },
  USD: { simbolo: 'US$', nombre: 'Dólar', locale: 'en-US' },
  BRL: { simbolo: 'R$', nombre: 'Real', locale: 'pt-BR' },
  MXN: { simbolo: 'MX$', nombre: 'Peso Mexicano', locale: 'es-MX' },
  EUR: { simbolo: '€', nombre: 'Euro', locale: 'es-ES' },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      seccion: 'dashboard',
      setSeccion: (s) => set({ seccion: s }),

      // Inicializa con la fecha real (mes y año actuales)
      // Nota: como esto corre en el cliente, no hay hydration mismatch
      mes: typeof window !== 'undefined' ? new Date().getMonth() + 1 : 1,
      anio: typeof window !== 'undefined' ? new Date().getFullYear() : 2026,
      setMesAnio: (mes, anio) => set({ mes, anio }),
      mesAnterior: () => {
        const { mes, anio } = get()
        if (mes === 1) set({ mes: 12, anio: anio - 1 })
        else set({ mes: mes - 1 })
      },
      mesSiguiente: () => {
        const { mes, anio } = get()
        if (mes === 12) set({ mes: 1, anio: anio + 1 })
        else set({ mes: mes + 1 })
      },
      initMesActual: () => {
        const now = new Date()
        set({ mes: now.getMonth() + 1, anio: now.getFullYear() })
      },

      usuarioActivoId: null,
      usuarioActivoNombre: 'Demo',
      usuarioActivoColor: '#6366f1',
      setUsuarioActivo: (u) => set({
        usuarioActivoId: u.id,
        usuarioActivoNombre: u.nombre,
        usuarioActivoColor: u.color,
      }),

      contactoActivoId: null,
      setContactoActivo: (id) => set({ contactoActivoId: id }),

      gastoDialogOpen: false,
      gastoEditandoId: null,
      gastoTipo: 'fijo',
      abrirGastoDialog: (tipo, editandoId = null) =>
        set({ gastoDialogOpen: true, gastoTipo: tipo, gastoEditandoId: editandoId }),
      cerrarGastoDialog: () =>
        set({ gastoDialogOpen: false, gastoEditandoId: null }),

      ingresoDialogOpen: false,
      abrirIngresoDialog: () => set({ ingresoDialogOpen: true }),
      cerrarIngresoDialog: () => set({ ingresoDialogOpen: false }),

      cmdkOpen: false,
      setCmdkOpen: (open) => set({ cmdkOpen: open }),

      // Preferencias (con defaults)
      apariencia: {
        tema: 'oscuro-premium',
        colorAcento: 'indigo',
        densidad: 'comoda',
        formatoMoneda: 'completo',
        moneda: 'ARS',
      },
      notificaciones: {
        vencimientos: true,
        transferencias: true,
        mensajes: true,
        metas: true,
        excesoPresupuesto: true,
        sonido: true,
      },
      finanzas: {
        diaCorte: 1,
        reglaNecesidades: 50,
        reglaDeseos: 30,
        reglaAhorros: 20,
        recordatorioDias: 3,
      },
      setApariencia: (a) => set((s) => ({ apariencia: { ...s.apariencia, ...a } })),
      setNotificaciones: (n) => set((s) => ({ notificaciones: { ...s.notificaciones, ...n } })),
      setFinanzas: (f) => set((s) => ({ finanzas: { ...s.finanzas, ...f } })),

      // Widgets del dashboard (configurables por el usuario)
      widgets: [
        { id: 'bento', visible: true, orden: 0 },
        { id: 'insights', visible: true, orden: 1 },
        { id: 'dona', visible: true, orden: 2 },
        { id: 'gastosVariables', visible: true, orden: 3 },
        { id: 'saldo', visible: true, orden: 4 },
        { id: 'metas', visible: true, orden: 5 },
      ],
      toggleWidget: (id) => set((s) => ({
        widgets: s.widgets.map((w) => w.id === id ? { ...w, visible: !w.visible } : w),
      })),
      reorderWidgets: (newWidgets) => set({ widgets: newWidgets }),
      resetWidgets: () => set({
        widgets: [
          { id: 'bento', visible: true, orden: 0 },
          { id: 'insights', visible: true, orden: 1 },
          { id: 'dona', visible: true, orden: 2 },
          { id: 'gastosVariables', visible: true, orden: 3 },
          { id: 'saldo', visible: true, orden: 4 },
          { id: 'metas', visible: true, orden: 5 },
        ],
      }),

      _hydrated: false,
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'wintexveo-storage',
      partialize: (state) => ({
        mes: state.mes,
        anio: state.anio,
        usuarioActivoId: state.usuarioActivoId,
        usuarioActivoNombre: state.usuarioActivoNombre,
        usuarioActivoColor: state.usuarioActivoColor,
        // No persistir 'seccion' para que después del login siempre arranque en dashboard
        apariencia: state.apariencia,
        notificaciones: state.notificaciones,
        finanzas: state.finanzas,
        widgets: state.widgets,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
