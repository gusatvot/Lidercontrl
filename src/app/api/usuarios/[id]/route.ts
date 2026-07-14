// PUT /api/usuarios/[id] - Actualizar usuario (nombre, email, color, avatar)
// DELETE /api/usuarios/[id] - Eliminar usuario

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

const COLORES_VALIDOS = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuarioActual = await getUsuarioActivo(req)
    const { id } = await params
    const body = await req.json()
    const { nombre, email, color, avatar } = body

    // Solo el propio usuario puede editarse (mock sin admin)
    if (usuarioActual.id !== id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const data: any = {}
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length < 1) {
        return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
      }
      data.nombre = nombre.trim()
    }
    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
      }
      data.email = email.trim().toLowerCase()
    }
    if (color !== undefined) {
      if (!COLORES_VALIDOS.includes(color)) {
        return NextResponse.json({ error: 'Color inválido' }, { status: 400 })
      }
      data.color = color
    }
    if (avatar !== undefined) data.avatar = avatar

    const updated = await db.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, color: true, avatar: true },
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    console.error('[PUT /api/usuarios/[id]]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuarioActual = await getUsuarioActivo(req)
    const { id } = await params

    // No se puede eliminar a sí mismo
    if (usuarioActual.id === id) {
      return NextResponse.json({ error: 'No podés eliminar tu propia cuenta' }, { status: 400 })
    }

    // Verificar que el usuario exista
    const existe = await db.usuario.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Cascade delete elimina cuenta, gastos, mensajes, etc.
    await db.usuario.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[DELETE /api/usuarios/[id]]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
