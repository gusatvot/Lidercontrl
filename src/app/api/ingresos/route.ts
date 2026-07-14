import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { createIngresoSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const mes = searchParams.get('mes') ? Number(searchParams.get('mes')) : undefined
    const anio = searchParams.get('anio') ? Number(searchParams.get('anio')) : undefined

    const ingresos = await db.ingreso.findMany({
      where: {
        usuarioId: usuario.id,
        ...(mes && { mes }),
        ...(anio && { anio }),
      },
      orderBy: [{ esFijo: 'desc' }, { fecha: 'desc' }],
    })

    return NextResponse.json(ingresos)
  } catch (e: any) {
    console.error('[GET /api/ingresos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const data = createIngresoSchema.parse(body)

    // Crear ingreso + sumar al saldo de la cuenta
    const resultado = await db.$transaction(async (tx) => {
      const ingreso = await tx.ingreso.create({
        data: {
          ...data,
          usuarioId: usuario.id,
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
        },
      })

      // Sumar al saldo
      await tx.cuenta.update({
        where: { usuarioId: usuario.id },
        data: { saldo: { increment: data.monto } },
      })

      return ingreso
    })

    return NextResponse.json(resultado, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/ingresos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
