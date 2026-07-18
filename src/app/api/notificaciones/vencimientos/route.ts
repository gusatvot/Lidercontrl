// GET /api/notificaciones/vencimientos
// Devuelve los gastos fijos pendientes que vencen en los próximos N días (default: 3)
// POST /api/notificaciones/vencimientos
// Envía email con vencimientos próximos a todos los usuarios (para cron job)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { calcularDiasVencimiento, enviarNotificacionVencimientos, type GastoPorVencer } from '@/lib/notificaciones'

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const diasThreshold = Number(searchParams.get('dias')) || 3

    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1
    const anioActual = hoy.getFullYear()
    const [mes, anio] = mesActual === 12 ? [1, anioActual + 1] : [mesActual + 1, anioActual]

    const gastos = await db.gastoFijo.findMany({
      where: {
        usuarioId: usuario.id,
        estado: 'pendiente',
        OR: [
          { mes: mesActual, anio: anioActual },
          { mes, anio },
        ],
      },
      orderBy: { diaVencimiento: 'asc' },
    })

    const porVencer: GastoPorVencer[] = gastos
      .map((g) => {
        const diasRestantes = calcularDiasVencimiento(g.diaVencimiento, g.mes, g.anio)
        return {
          id: g.id,
          concepto: g.concepto,
          categoria: g.categoria,
          monto: g.monto,
          diaVencimiento: g.diaVencimiento,
          diasRestantes,
          mes: g.mes,
          anio: g.anio,
        }
      })
      .filter((g) => g.diasRestantes <= diasThreshold)

    return NextResponse.json({
      gastos: porVencer,
      total: porVencer.reduce((s, g) => s + g.monto, 0),
      configDias: diasThreshold,
    })
  } catch (e: any) {
    console.error('[GET /api/notificaciones/vencimientos]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const diasThreshold = Number(body.dias) || 3

    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1
    const anioActual = hoy.getFullYear()
    const [mesProx, anioProx] = mesActual === 12 ? [1, anioActual + 1] : [mesActual + 1, anioActual]

    const usuarios = await db.usuario.findMany({
      where: { emailVerificado: true },
      select: { id: true, nombre: true, email: true },
    })

    let emailsEnviados = 0
    let errores = 0

    for (const usuario of usuarios) {
      try {
        const gastos = await db.gastoFijo.findMany({
          where: {
            usuarioId: usuario.id,
            estado: 'pendiente',
            OR: [
              { mes: mesActual, anio: anioActual },
              { mes: mesProx, anio: anioProx },
            ],
          },
        })

        const porVencer: GastoPorVencer[] = gastos
          .map((g) => ({
            id: g.id,
            concepto: g.concepto,
            categoria: g.categoria,
            monto: g.monto,
            diaVencimiento: g.diaVencimiento,
            diasRestantes: calcularDiasVencimiento(g.diaVencimiento, g.mes, g.anio),
            mes: g.mes,
            anio: g.anio,
          }))
          .filter((g) => g.diasRestantes <= diasThreshold && g.diasRestantes >= -1)

        if (porVencer.length === 0) continue

        const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const yaNotificados = porVencer.filter((g) => {
          return gastos.find((dbG) => dbG.id === g.id && dbG.ultimaNotificacionEn && dbG.ultimaNotificacionEn > hace24h)
        })
        if (yaNotificados.length === porVencer.length) continue

        const result = await enviarNotificacionVencimientos(req, usuario, porVencer, { mes: mesActual, anio: anioActual })

        if (result.success) {
          emailsEnviados++
          await db.gastoFijo.updateMany({
            where: { id: { in: porVencer.map((g) => g.id) } },
            data: { ultimaNotificacionEn: new Date() },
          })
        } else {
          errores++
          console.error(`[Cron] Error enviando a ${usuario.email}:`, result.error)
        }
      } catch (e) {
        errores++
        console.error(`[Cron] Error procesando usuario ${usuario.id}:`, e)
      }
    }

    return NextResponse.json({
      ok: true,
      usuariosProcesados: usuarios.length,
      emailsEnviados,
      errores,
      fecha: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error('[POST /api/notificaciones/vencimientos]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}