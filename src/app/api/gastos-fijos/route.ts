import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { createGastoFijoSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const mes = searchParams.get('mes') ? Number(searchParams.get('mes')) : undefined
    const anio = searchParams.get('anio') ? Number(searchParams.get('anio')) : undefined
    const estado = searchParams.get('estado') || undefined

    const gastos = await db.gastoFijo.findMany({
      where: {
        usuarioId: usuario.id,
        ...(mes && { mes }),
        ...(anio && { anio }),
        ...(estado && { estado }),
      },
      orderBy: [{ diaVencimiento: 'asc' }],
    })

    return NextResponse.json(gastos)
  } catch (e: any) {
    console.error('[GET /api/gastos-fijos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const data = createGastoFijoSchema.parse(body)

    const gasto = await db.gastoFijo.create({
      data: { ...data, usuarioId: usuario.id },
    })

    return NextResponse.json(gasto, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/gastos-fijos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
