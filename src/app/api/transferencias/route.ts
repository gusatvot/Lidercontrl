import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { createTransferenciaSchema } from '@/lib/validations'

// POST: crear transferencia (crea mensaje tipo transferencia + registro)
export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const data = createTransferenciaSchema.parse(body)

    if (data.destinatarioId === usuario.id) {
      return NextResponse.json({ error: 'No podés transferirte a vos mismo' }, { status: 400 })
    }

    // Verificar saldo suficiente
    const cuentaOrigen = await db.cuenta.findUnique({ where: { usuarioId: usuario.id } })
    if (!cuentaOrigen || cuentaOrigen.saldo < data.monto) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Crear mensaje + transferencia en una transacción
    const resultado = await db.$transaction(async (tx) => {
      const mensaje = await tx.mensaje.create({
        data: {
          remitenteId: usuario.id,
          destinatarioId: data.destinatarioId,
          tipo: 'transferencia',
          contenido: data.concepto,
        },
      })

      const transferencia = await tx.transferencia.create({
        data: {
          mensajeId: mensaje.id,
          monto: data.monto,
          concepto: data.concepto,
          estado: 'pendiente',
          cuentaOrigenId: usuario.id,
          cuentaDestinoId: data.destinatarioId,
        },
      })

      return { mensaje, transferencia }
    })

    // Incluir remitente en la respuesta
    const mensajeCompleto = await db.mensaje.findUnique({
      where: { id: resultado.mensaje.id },
      include: {
        remitente: { select: { id: true, nombre: true, color: true } },
        transferencia: true,
      },
    })

    return NextResponse.json(mensajeCompleto, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/transferencias]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
