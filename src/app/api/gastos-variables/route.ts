import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { createGastoVariableSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const mes = searchParams.get('mes') ? Number(searchParams.get('mes')) : undefined
    const anio = searchParams.get('anio') ? Number(searchParams.get('anio')) : undefined

    const gastos = await db.gastoVariable.findMany({
      where: {
        usuarioId: usuario.id,
        ...(mes && { mes }),
        ...(anio && { anio }),
      },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json(gastos)
  } catch (e: any) {
    console.error('[GET /api/gastos-variables]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const data = createGastoVariableSchema.parse(body)

    const gasto = await db.gastoVariable.create({
      data: {
        ...data,
        usuarioId: usuario.id,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
    })

    return NextResponse.json(gasto, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/gastos-variables]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
