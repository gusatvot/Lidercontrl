import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { createMensajeSchema } from '@/lib/validations'

// GET /api/mensajes?contactoId=xxx → devuelve conversación con ese contacto
export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const contactoId = searchParams.get('contactoId')

    if (!contactoId) {
      // Devolver lista de conversaciones (último mensaje con cada contacto)
      const usuarios = await db.usuario.findMany({
        where: { id: { not: usuario.id } },
        select: { id: true, nombre: true, color: true, email: true },
      })

      const conversaciones = await Promise.all(
        usuarios.map(async (u) => {
          const ultimo = await db.mensaje.findFirst({
            where: {
              OR: [
                { remitenteId: usuario.id, destinatarioId: u.id },
                { remitenteId: u.id, destinatarioId: usuario.id },
              ],
            },
            orderBy: { creadoEn: 'desc' },
            include: { transferencia: true },
          })
          const noLeidos = await db.mensaje.count({
            where: { remitenteId: u.id, destinatarioId: usuario.id, leido: false },
          })
          return { contacto: u, ultimoMensaje: ultimo, noLeidos }
        })
      )

      return NextResponse.json(conversaciones.filter((c) => c.ultimoMensaje !== null))
    }

    // Devolver mensajes con un contacto específico
    const mensajes = await db.mensaje.findMany({
      where: {
        OR: [
          { remitenteId: usuario.id, destinatarioId: contactoId },
          { remitenteId: contactoId, destinatarioId: usuario.id },
        ],
      },
      include: {
        remitente: { select: { id: true, nombre: true, color: true } },
        transferencia: true,
      },
      orderBy: { creadoEn: 'asc' },
    })

    // Marcar como leídos los que recibí
    await db.mensaje.updateMany({
      where: { remitenteId: contactoId, destinatarioId: usuario.id, leido: false },
      data: { leido: true },
    })

    return NextResponse.json(mensajes)
  } catch (e: any) {
    console.error('[GET /api/mensajes]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const data = createMensajeSchema.parse(body)

    if (data.destinatarioId === usuario.id) {
      return NextResponse.json({ error: 'No podés enviarte un mensaje a vos mismo' }, { status: 400 })
    }

    const mensaje = await db.mensaje.create({
      data: {
        remitenteId: usuario.id,
        destinatarioId: data.destinatarioId,
        tipo: data.tipo,
        contenido: data.contenido || null,
        transcripcion: data.transcripcion || null,
        duracionSeg: data.duracionSeg || null,
      },
      include: {
        remitente: { select: { id: true, nombre: true, color: true } },
      },
    })

    return NextResponse.json(mensaje, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/mensajes]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
