import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { z } from 'zod'

const updateSchema = z.object({
  concepto: z.string().min(1).max(100).optional(),
  categoria: z.string().min(1).optional(),
  monto: z.number().positive().optional(),
  fecha: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { id } = await params
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existente = await db.gastoVariable.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const updateData: any = {}
    if (data.concepto !== undefined) updateData.concepto = data.concepto
    if (data.categoria !== undefined) updateData.categoria = data.categoria
    if (data.monto !== undefined) updateData.monto = data.monto
    if (data.fecha !== undefined) updateData.fecha = new Date(data.fecha)

    const gasto = await db.gastoVariable.update({ where: { id }, data: updateData })
    return NextResponse.json(gasto)
  } catch (e: any) {
    if (e.name === 'UnauthorizedError') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    console.error('[PUT /api/gastos-variables/[id]]', e)
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(_req)
    const { id } = await params

    const existente = await db.gastoVariable.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await db.gastoVariable.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.name === 'UnauthorizedError') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
