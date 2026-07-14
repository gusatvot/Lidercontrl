// LiderControl - Validaciones Zod (mismo schema en cliente y servidor)
import { z } from 'zod'

export const createGastoFijoSchema = z.object({
  concepto: z.string().min(1, 'El concepto es obligatorio').max(100),
  categoria: z.string().min(1, 'La categoría es obligatoria'),
  monto: z.number().positive('El monto debe ser positivo'),
  diaVencimiento: z.number().int().min(1).max(31),
  estado: z.enum(['pagado', 'pendiente']).default('pendiente'),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2100),
  nota: z.string().max(500).optional(),
})

export const updateGastoFijoSchema = z.object({
  concepto: z.string().min(1).max(100).optional(),
  categoria: z.string().min(1).optional(),
  monto: z.number().positive().optional(),
  diaVencimiento: z.number().int().min(1).max(31).optional(),
  estado: z.enum(['pagado', 'pendiente']).optional(),
  nota: z.string().max(500).optional(),
})

export const createGastoVariableSchema = z.object({
  concepto: z.string().min(1, 'El concepto es obligatorio').max(100),
  categoria: z.string().min(1),
  monto: z.number().positive('El monto debe ser positivo'),
  fecha: z.string().optional(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2100),
})

export const createIngresoSchema = z.object({
  concepto: z.string().min(1, 'El concepto es obligatorio').max(100),
  categoria: z.string().min(1, 'La categoría es obligatoria'),
  monto: z.number().positive('El monto debe ser positivo'),
  fecha: z.string().optional(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2100),
  esFijo: z.boolean().default(false),
  nota: z.string().max(500).optional(),
})

export const createMensajeSchema = z.object({
  destinatarioId: z.string().min(1),
  tipo: z.enum(['texto', 'audio', 'transferencia']),
  contenido: z.string().max(2000).optional(),
  transcripcion: z.string().max(2000).optional(),
  duracionSeg: z.number().int().positive().optional(),
})

export const createTransferenciaSchema = z.object({
  destinatarioId: z.string().min(1),
  monto: z.number().positive('El monto debe ser positivo'),
  concepto: z.string().min(1).max(200),
})

export type CreateGastoFijoInput = z.infer<typeof createGastoFijoSchema>
export type UpdateGastoFijoInput = z.infer<typeof updateGastoFijoSchema>
export type CreateGastoVariableInput = z.infer<typeof createGastoVariableSchema>
export type CreateIngresoInput = z.infer<typeof createIngresoSchema>
export type CreateMensajeInput = z.infer<typeof createMensajeSchema>
export type CreateTransferenciaInput = z.infer<typeof createTransferenciaSchema>
