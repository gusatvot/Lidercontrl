// GET /api/auth/me → info del usuario autenticado o null

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ usuario: null })
    }

    const usuario = await db.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        username: true,
        color: true,
        emailVerificado: true,
      },
    })

    return NextResponse.json({ usuario })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
