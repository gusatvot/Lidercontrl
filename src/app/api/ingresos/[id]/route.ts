import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { z } from 'zod'

const updateSchema = z.object({
  concepto: z.string().min(1).max(100).optional(),
  categoria: z.string().min(1).optional(),
  monto: z.number().positive().optional(),
  fecha: z.string().optional(),
  esFijo: z.boolean().optional(),
  nota: z.string().max(500).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { id } = await params
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existente = await db.ingreso.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const updateData: any = {}
    if (data.concepto !== undefined) updateData.concepto = data.concepto
    if (data.categoria !== undefined) updateData.categoria = data.categoria
    if (data.monto !== undefined) {
      // Si cambia el monto, ajustar el saldo
      const diff = data.monto - existente.monto
      await db.cuenta.update({
        where: { usuarioId: usuario.id },
        data: { saldo: { increment: diff } },
      })
      updateData.monto = data.monto
    }
    if (data.fecha !== undefined) updateData.fecha = new Date(data.fecha)
    if (data.esFijo !== undefined) updateData.esFijo = data.esFijo
    if (data.nota !== undefined) updateData.nota = data.nota

    const ingreso = await db.ingreso.update({ where: { id }, data: updateData })
    return NextResponse.json(ingreso)
  } catch (e: any) {
    if (e.name === 'UnauthorizedError') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    console.error('[PUT /api/ingresos/[id]]', e)
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(_req)
    const { id } = await params

    const existente = await db.ingreso.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Restar del saldo
    await db.$transaction(async (tx) => {
      await tx.ingreso.delete({ where: { id } })
      await tx.cuenta.update({
        where: { usuarioId: usuario.id },
        data: { saldo: { decrement: existente.monto } },
      })
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.name === 'UnauthorizedError') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
