// POST /api/auth/register
// Body: { nombre, username, email, password, color }
// Crea usuario con password hasheado + token de verificación
// Envía email de verificación vía Resend (o loguea en dev sin API key)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { sendEmail, emailVerificacionHtml, emailVerificacionText } from '@/lib/email'

const COLORES_VALIDOS = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  username: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100),
  color: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Normalizar
    const username = data.username.toLowerCase().trim()
    const email = data.email.toLowerCase().trim()

    // Verificar duplicados
    const existeEmail = await db.usuario.findUnique({ where: { email } })
    if (existeEmail) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email' },
        { status: 400 }
      )
    }

    const existeUsername = await db.usuario.findUnique({ where: { username } })
    if (existeUsername) {
      return NextResponse.json(
        { error: 'Ese nombre de usuario ya está tomado' },
        { status: 400 }
      )
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Generar token de verificación
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const colorFinal = COLORES_VALIDOS.includes(data.color || '') ? data.color! : '#6366f1'

    // Crear usuario + cuenta en transacción
    const nuevo = await db.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre: data.nombre.trim(),
          username,
          email,
          password: passwordHash,
          color: colorFinal,
          emailVerificado: false,
          tokenVerificacion: token,
          tokenExpira,
        },
      })
      await tx.cuenta.create({
        data: {
          usuarioId: usuario.id,
          ingresoMensual: 0,
          metaAhorroMensual: 0,
          presupuestoVariables: 0,
          saldo: 0,
        },
      })
      return usuario
    })

    // Enviar email de verificación (Resend en prod, log en dev)
    const verificationUrl = `${req.nextUrl.origin}/?verify=${token}`
    const emailResult = await sendEmail(req, {
      to: nuevo.email,
      subject: 'Verificá tu cuenta en LiderControl',
      html: emailVerificacionHtml(nuevo.nombre, verificationUrl),
      text: emailVerificacionText(nuevo.nombre, verificationUrl),
    })

    return NextResponse.json({
      ok: true,
      usuario: {
        id: nuevo.id,
        nombre: nuevo.nombre,
        username: nuevo.username,
        email: nuevo.email,
      },
      verificationUrl: emailResult.devUrl ? verificationUrl : undefined,
      emailEnviado: emailResult.success,
      emailError: emailResult.error,
      mensaje: emailResult.success
        ? 'Cuenta creada. Te enviamos un email de verificación.'
        : `Cuenta creada pero no pudimos enviar el email: ${emailResult.error}`,
    }, { status: 201 })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }
    console.error('[POST /api/auth/register]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
