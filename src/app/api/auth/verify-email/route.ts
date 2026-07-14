// POST /api/auth/verify-email
// Body: { token } → marca email como verificado

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const usuario = await db.usuario.findFirst({
      where: {
        tokenVerificacion: token,
        tokenExpira: { gt: new Date() },
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido o expirado. Solicitá uno nuevo.' },
        { status: 400 }
      )
    }

    await db.usuario.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        tokenVerificacion: null,
        tokenExpira: null,
      },
    })

    return NextResponse.json({
      ok: true,
      mensaje: 'Email verificado correctamente. Ya podés iniciar sesión.',
    })
  } catch (e: any) {
    console.error('[POST /api/auth/verify-email]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
