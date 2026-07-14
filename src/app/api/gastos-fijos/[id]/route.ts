import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { updateGastoFijoSchema } from '@/lib/validations'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { id } = await params
    const body = await req.json()
    const data = updateGastoFijoSchema.parse(body)

    // Verificar ownership
    const existente = await db.gastoFijo.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const gasto = await db.gastoFijo.update({ where: { id }, data })
    return NextResponse.json(gasto)
  } catch (e: any) {
    console.error('[PUT /api/gastos-fijos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(_req)
    const { id } = await params

    const existente = await db.gastoFijo.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await db.gastoFijo.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[DELETE /api/gastos-fijos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
