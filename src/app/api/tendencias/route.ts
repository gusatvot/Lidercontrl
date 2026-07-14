// GET /api/tendencias → datos de los últimos 6 meses para gráfico
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { MESES } from '@/lib/types'

export async function GET() {
  try {
    const usuario = await getUsuarioActivo()

    // Generar últimos 6 meses
    const now = new Date()
    const meses: { mes: number; anio: number; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      meses.push({
        mes: d.getMonth() + 1,
        anio: d.getFullYear(),
        label: MESES[d.getMonth()].slice(0, 3),
      })
    }

    // Query paralela para todos los meses
    const datos = await Promise.all(
      meses.map(async (m) => {
        const [gastosFijos, gastosVariables, ingresos] = await Promise.all([
          db.gastoFijo.aggregate({
            where: { usuarioId: usuario.id, mes: m.mes, anio: m.anio },
            _sum: { monto: true },
          }),
          db.gastoVariable.aggregate({
            where: { usuarioId: usuario.id, mes: m.mes, anio: m.anio },
            _sum: { monto: true },
          }),
          db.ingreso.aggregate({
            where: { usuarioId: usuario.id, mes: m.mes, anio: m.anio },
            _sum: { monto: true },
          }),
        ])

        return {
          mes: m.label,
          ingresos: ingresos._sum.monto || 0,
          gastos: (gastosFijos._sum.monto || 0) + (gastosVariables._sum.monto || 0),
          gastosFijos: gastosFijos._sum.monto || 0,
          gastosVariables: gastosVariables._sum.monto || 0,
          ahorro: (ingresos._sum.monto || 0) - ((gastosFijos._sum.monto || 0) + (gastosVariables._sum.monto || 0)),
        }
      })
    )

    return NextResponse.json({ meses: datos })
  } catch (e: any) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    console.error('[GET /api/tendencias]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
