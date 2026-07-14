// LiderControl - Tipos compartidos entre frontend y backend
// Este archivo es la única fuente de verdad para los tipos de datos

export type TipoMensaje = 'texto' | 'audio' | 'transferencia'
export type EstadoGasto = 'pagado' | 'pendiente'
export type EstadoTransferencia = 'pendiente' | 'aceptada' | 'rechazada' | 'completada'

export interface UsuarioDTO {
  id: string
  nombre: string
  email: string
  color: string
  avatar?: string | null
}

export interface CuentaDTO {
  id: string
  usuarioId: string
  ingresoMensual: number
  metaAhorroMensual: number
  presupuestoVariables: number
  saldo: number
}

export interface GastoFijoDTO {
  id: string
  usuarioId: string
  concepto: string
  categoria: string
  monto: number
  diaVencimiento: number
  mes: number
  anio: number
  estado: EstadoGasto
  nota?: string | null
  creadoEn: string
  actualizadoEn: string
}

export interface GastoVariableDTO {
  id: string
  usuarioId: string
  concepto: string
  categoria: string
  monto: number
  fecha: string
  mes: number
  anio: number
  creadoEn: string
}

export interface MetaAhorroDTO {
  id: string
  usuarioId: string
  titulo: string
  montoObjetivo: number
  montoActual: number
  mes: number
  anio: number
}

export interface IngresoDTO {
  id: string
  usuarioId: string
  concepto: string
  categoria: string
  monto: number
  fecha: string
  mes: number
  anio: number
  esFijo: boolean
  nota?: string | null
  creadoEn: string
}

export interface MensajeDTO {
  id: string
  remitenteId: string
  destinatarioId: string
  remitente?: UsuarioDTO
  tipo: TipoMensaje
  contenido?: string | null
  transcripcion?: string | null
  duracionSeg?: number | null
  leido: boolean
  creadoEn: string
  transferencia?: TransferenciaDTO | null
}

export interface TransferenciaDTO {
  id: string
  mensajeId: string
  monto: number
  concepto: string
  estado: EstadoTransferencia
  cuentaOrigenId: string
  cuentaDestinoId: string
  creadoEn: string
}

// ============= PAYLOADS (input de API) =============

export interface CreateGastoFijoInput {
  concepto: string
  categoria: string
  monto: number
  diaVencimiento: number
  estado?: EstadoGasto
  mes: number
  anio: number
  nota?: string
}

export interface UpdateGastoFijoInput {
  concepto?: string
  categoria?: string
  monto?: number
  diaVencimiento?: number
  estado?: EstadoGasto
  nota?: string
}

export interface CreateGastoVariableInput {
  concepto: string
  categoria: string
  monto: number
  fecha?: string
  mes: number
  anio: number
}

export interface CreateIngresoInput {
  concepto: string
  categoria: string
  monto: number
  fecha?: string
  mes: number
  anio: number
  esFijo?: boolean
  nota?: string
}

export interface CreateMensajeInput {
  destinatarioId: string
  tipo: TipoMensaje
  contenido?: string
  transcripcion?: string
  duracionSeg?: number
}

export interface CreateTransferenciaInput {
  destinatarioId: string
  monto: number
  concepto: string
}

// ============= HELPERS =============

export const CATEGORIAS_GASTO_FIJO = [
  'Vivienda',
  'Educación',
  'Deudas',
  'Servicios',
  'Salud',
  'Seguros',
  'Suscripciones',
  'Transporte',
  'Otros',
] as const

export const CATEGORIAS_GASTO_VARIABLE = [
  'Comida',
  'Ocio',
  'Transporte',
  'Salud',
  'Ropa',
  'Regalos',
  'Imprevistos',
  'Otros',
] as const

export const CATEGORIAS_INGRESO = [
  'Sueldo',
  'Extra',
  'Regalo',
  'Reembolso',
  'Inversión',
  'Freelance',
  'Ventas',
  'Otros',
] as const

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const
