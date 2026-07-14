import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

// GET /api/dashboard?mes=1&anio=2026 → datos agregados del dashboard
export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const mes = Number(searchParams.get('mes')) || new Date().getMonth() + 1
    const anio = Number(searchParams.get('anio')) || new Date().getFullYear()

    const [cuenta, gastosFijos, gastosVariables, metas, ingresos] = await Promise.all([
      db.cuenta.findUnique({ where: { usuarioId: usuario.id } }),
      db.gastoFijo.findMany({
        where: { usuarioId: usuario.id, mes, anio },
        orderBy: { diaVencimiento: 'asc' },
      }),
      db.gastoVariable.findMany({
        where: { usuarioId: usuario.id, mes, anio },
        orderBy: { fecha: 'desc' },
      }),
      db.metaAhorro.findMany({
        where: { usuarioId: usuario.id, mes, anio },
      }),
      db.ingreso.findMany({
        where: { usuarioId: usuario.id, mes, anio },
        orderBy: [{ esFijo: 'desc' }, { fecha: 'desc' }],
      }),
    ])

    const totalGastosFijos = gastosFijos.reduce((s, g) => s + g.monto, 0)
    const totalGastosFijosPagados = gastosFijos
      .filter((g) => g.estado === 'pagado')
      .reduce((s, g) => s + g.monto, 0)
    const totalGastosVariables = gastosVariables.reduce((s, g) => s + g.monto, 0)
    const totalAhorros = metas.reduce((s, m) => s + m.montoActual, 0)
    const metaAhorroTotal = metas.reduce((s, m) => s + m.montoObjetivo, 0)

    // Ingresos: total del mes + distinción fijos vs extras
    const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0)
    const totalIngresosFijos = ingresos.filter((i) => i.esFijo).reduce((s, i) => s + i.monto, 0)
    const totalIngresosExtras = ingresos.filter((i) => !i.esFijo).reduce((s, i) => s + i.monto, 0)

    // Para compat con versión anterior: ingresoMensual de cuenta + extras = total
    const ingresoMensualConfig = cuenta?.ingresoMensual || 0
    // Si hay ingresos fijos registrados este mes, usarlos; si no, usar el de la cuenta
    const ingresoMensual = totalIngresosFijos > 0 ? totalIngresosFijos : ingresoMensualConfig
    const ingresoTotal = ingresoMensual + totalIngresosExtras
    const presupuestoVariables = cuenta?.presupuestoVariables || 0
    const metaAhorroMensual = cuenta?.metaAhorroMensual || 0

    // Cálculo 50/30/20 (sobre ingreso total: fijo + extras)
    const distribucion = {
      necesidades: { monto: ingresoTotal * 0.5, porcentaje: 50, real: totalGastosFijos },
      deseos: { monto: ingresoTotal * 0.3, porcentaje: 30, real: totalGastosVariables },
      ahorros: { monto: ingresoTotal * 0.2, porcentaje: 20, real: totalAhorros },
    }

    return NextResponse.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, color: usuario.color, email: usuario.email },
      cuenta,
      mes,
      anio,
      gastosFijos,
      gastosVariables,
      metas,
      ingresos,
      resumen: {
        ingresoMensual,
        ingresoTotal,
        totalIngresos,
        totalIngresosFijos,
        totalIngresosExtras,
        totalGastosFijos,
        totalGastosFijosPagados,
        totalGastosFijosPendientes: totalGastosFijos - totalGastosFijosPagados,
        totalGastosVariables,
        presupuestoVariables,
        metaAhorroMensual,
        totalAhorros,
        metaAhorroTotal,
        saldo: cuenta?.saldo || 0,
      },
      distribucion,
    })
  } catch (e: any) {
    console.error('[GET /api/dashboard]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
