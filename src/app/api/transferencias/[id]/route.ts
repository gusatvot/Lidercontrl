import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

// PUT /api/transferencias/[id] → aceptar o rechazar
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { id } = await params
    const { accion } = await req.json() // "aceptar" | "rechazar"

    const transf = await db.transferencia.findUnique({
      where: { id },
      include: { mensaje: true },
    })
    if (!transf) return NextResponse.json({ error: 'Transferencia no encontrada' }, { status: 404 })

    // Solo el destinatario puede aceptar/rechazar
    if (transf.cuentaDestinoId !== usuario.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    if (transf.estado !== 'pendiente') {
      return NextResponse.json({ error: 'La transferencia ya fue procesada' }, { status: 400 })
    }

    if (accion === 'aceptar') {
      // Transacción atómica: mover saldo
      await db.$transaction(async (tx) => {
        const origen = await tx.cuenta.findUnique({ where: { usuarioId: transf.cuentaOrigenId } })
        if (!origen || origen.saldo < transf.monto) {
          throw new Error('El remitente no tiene saldo suficiente')
        }
        await tx.cuenta.update({
          where: { usuarioId: transf.cuentaOrigenId },
          data: { saldo: { decrement: transf.monto } },
        })
        await tx.cuenta.update({
          where: { usuarioId: transf.cuentaDestinoId },
          data: { saldo: { increment: transf.monto } },
        })
        await tx.transferencia.update({
          where: { id },
          data: { estado: 'completada' },
        })
      })
    } else if (accion === 'rechazar') {
      await db.transferencia.update({ where: { id }, data: { estado: 'rechazada' } })
    } else {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }

    const actualizada = await db.transferencia.findUnique({
      where: { id },
      include: { mensaje: { include: { remitente: true } } },
    })
    return NextResponse.json(actualizada)
  } catch (e: any) {
    console.error('[PUT /api/transferencias]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
