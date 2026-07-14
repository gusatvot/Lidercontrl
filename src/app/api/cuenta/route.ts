import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

export async function GET() {
  try {
    const usuario = await getUsuarioActivo()
    const cuenta = await db.cuenta.findUnique({ where: { usuarioId: usuario.id } })
    if (!cuenta) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    return NextResponse.json(cuenta)
  } catch (e: any) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const { ingresoMensual, metaAhorroMensual, presupuestoVariables, saldo } = body

    const cuenta = await db.cuenta.upsert({
      where: { usuarioId: usuario.id },
      update: {
        ...(ingresoMensual !== undefined && { ingresoMensual: Number(ingresoMensual) }),
        ...(metaAhorroMensual !== undefined && { metaAhorroMensual: Number(metaAhorroMensual) }),
        ...(presupuestoVariables !== undefined && { presupuestoVariables: Number(presupuestoVariables) }),
        ...(saldo !== undefined && { saldo: Number(saldo) }),
      },
      create: {
        usuarioId: usuario.id,
        ingresoMensual: Number(ingresoMensual) || 0,
        metaAhorroMensual: Number(metaAhorroMensual) || 0,
        presupuestoVariables: Number(presupuestoVariables) || 0,
        saldo: Number(saldo) || 0,
      },
    })

    return NextResponse.json(cuenta)
  } catch (e: any) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
