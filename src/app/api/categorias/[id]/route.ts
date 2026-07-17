// PUT /api/categorias/[id] → editar categoría personalizada
// DELETE /api/categorias/[id] → eliminar categoría personalizada
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { z } from 'zod'

const updateCategoriaSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').optional(),
  icono: z.string().max(10).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { id } = await params
    const body = await req.json()
    const data = updateCategoriaSchema.parse(body)

    // No permitir editar categorías default (tienen id "default-XXX")
    if (id.startsWith('default-')) {
      return NextResponse.json(
        { error: 'Las categorías default no se pueden editar' },
        { status: 400 }
      )
    }

    // Verificar ownership
    const existente = await db.categoria.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Si cambia el nombre, verificar que no exista otra con ese nombre
    if (data.nombre && data.nombre !== existente.nombre) {
      const duplicada = await db.categoria.findFirst({
        where: {
          usuarioId: usuario.id,
          nombre: data.nombre,
          tipo: existente.tipo,
          NOT: { id },
        },
      })
      if (duplicada && duplicada.nombre.toLowerCase() === data.nombre.toLowerCase()) {
        return NextResponse.json({ error: 'Ya tenés una categoría con ese nombre' }, { status: 400 })
      }
    }

    const actualizada = await db.categoria.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre.trim() }),
        ...(data.color && { color: data.color }),
        ...(data.icono && { icono: data.icono }),
      },
    })

    return NextResponse.json(actualizada)
  } catch (e: any) {
    console.error('[PUT /api/categorias]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { id } = await params

    if (id.startsWith('default-')) {
      return NextResponse.json(
        { error: 'Las categorías default no se pueden eliminar' },
        { status: 400 }
      )
    }

    const existente = await db.categoria.findUnique({ where: { id } })
    if (!existente || existente.usuarioId !== usuario.id) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Verificar si hay movimientos usando esta categoría
    const tipo = existente.tipo
    let enUso = false
    if (tipo === 'gasto-fijo') {
      enUso = !!(await db.gastoFijo.findFirst({ where: { usuarioId: usuario.id, categoria: existente.nombre } }))
    } else if (tipo === 'gasto-variable') {
      enUso = !!(await db.gastoVariable.findFirst({ where: { usuarioId: usuario.id, categoria: existente.nombre } }))
    } else if (tipo === 'ingreso') {
      enUso = !!(await db.ingreso.findFirst({ where: { usuarioId: usuario.id, categoria: existente.nombre } }))
    }

    if (enUso) {
      return NextResponse.json(
        { error: 'No se puede eliminar: hay movimientos usando esta categoría. Renombrá o eliminá esos movimientos primero.' },
        { status: 400 }
      )
    }

    await db.categoria.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[DELETE /api/categorias]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
