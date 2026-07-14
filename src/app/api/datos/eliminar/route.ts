// POST /api/datos/eliminar - Elimina todos los datos del usuario activo (menos su cuenta)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json().catch(() => ({}))
    const { confirmacion } = body

    if (confirmacion !== 'ELIMINAR TODO') {
      return NextResponse.json(
        { error: 'Confirmación requerida. Enviá { confirmacion: "ELIMINAR TODO" }' },
        { status: 400 }
      )
    }

    // Eliminar todo del usuario (cascade no aplica porque algunas relaciones son via ForeignKey)
    await db.$transaction(async (tx) => {
      // Transferencias donde es origen o destino
      await tx.transferencia.deleteMany({
        where: { OR: [{ cuentaOrigenId: usuario.id }, { cuentaDestinoId: usuario.id }] },
      })
      // Mensajes enviados o recibidos
      await tx.mensaje.deleteMany({
        where: { OR: [{ remitenteId: usuario.id }, { destinatarioId: usuario.id }] },
      })
      await tx.metaAhorro.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.gastoVariable.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.gastoFijo.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.ingreso.deleteMany({ where: { usuarioId: usuario.id } })
      // Resetear cuenta
      await tx.cuenta.update({
        where: { usuarioId: usuario.id },
        data: {
          saldo: 0,
          ingresoMensual: 0,
          metaAhorroMensual: 0,
          presupuestoVariables: 0,
        },
      })
    })

    return NextResponse.json({ ok: true, mensaje: 'Todos los datos fueron eliminados' })
  } catch (e: any) {
    console.error('[POST /api/datos/eliminar]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
