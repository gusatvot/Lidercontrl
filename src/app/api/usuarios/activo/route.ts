import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, setUsuarioActivoId } from '@/lib/session'

// Cambiar usuario activo (mock de multi-usuario)
export async function POST(req: NextRequest) {
  try {
    const { usuarioId } = await req.json()
    const usuario = await db.usuario.findUnique({ where: { id: usuarioId } })
    if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    // Setear en memoria del proceso server-side
    setUsuarioActivoId(usuario.id)

    return NextResponse.json({
      ok: true,
      usuario: { id: usuario.id, nombre: usuario.nombre, color: usuario.color, email: usuario.email },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      color: usuario.color,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
