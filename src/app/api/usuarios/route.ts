import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const COLORES_VALIDOS = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']

export async function GET() {
  try {
    const usuarios = await db.usuario.findMany({
      select: { id: true, nombre: true, email: true, color: true, creadoEn: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(usuarios)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, color } = body

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 1) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Verificar email único
    const existe = await db.usuario.findUnique({ where: { email: email.toLowerCase() } })
    if (existe) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 400 })
    }

    const colorFinal = COLORES_VALIDOS.includes(color) ? color : '#6366f1'

    // Crear usuario + cuenta asociada
    const nuevo = await db.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre: nombre.trim(),
          email: email.toLowerCase().trim(),
          color: colorFinal,
        },
      })
      // Crear cuenta vacía
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

    return NextResponse.json({
      id: nuevo.id,
      nombre: nuevo.nombre,
      email: nuevo.email,
      color: nuevo.color,
    }, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/usuarios]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
