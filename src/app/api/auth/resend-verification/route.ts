// POST /api/auth/resend-verification
// Body: { email } → genera nuevo token y reenvía email de verificación

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { sendEmail, emailVerificacionHtml, emailVerificacionText } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const usuario = await db.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Por seguridad: no revelar si el email existe o no.
    if (!usuario || usuario.emailVerificado) {
      return NextResponse.json({
        ok: true,
        mensaje: 'Si la cuenta existe y no está verificada, te enviamos un email.',
      })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.usuario.update({
      where: { id: usuario.id },
      data: { tokenVerificacion: token, tokenExpira },
    })

    const verificationUrl = `${req.nextUrl.origin}/?verify=${token}`
    const emailResult = await sendEmail(req, {
      to: usuario.email,
      subject: 'Verificá tu cuenta en LiderControl',
      html: emailVerificacionHtml(usuario.nombre, verificationUrl),
      text: emailVerificacionText(usuario.nombre, verificationUrl),
    })

    return NextResponse.json({
      ok: true,
      verificationUrl: emailResult.devUrl ? verificationUrl : undefined,
      emailEnviado: emailResult.success,
      mensaje: emailResult.success
        ? 'Te enviamos un nuevo email de verificación.'
        : `No pudimos enviar el email: ${emailResult.error}`,
    })
  } catch (e: any) {
    console.error('[POST /api/auth/resend-verification]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
