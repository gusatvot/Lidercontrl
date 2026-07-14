// GET /api/reportes?mes=1&anio=2026 → datos completos para reportes
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const { searchParams } = new URL(req.url)
    const mes = Number(searchParams.get('mes')) || new Date().getMonth() + 1
    const anio = Number(searchParams.get('anio')) || new Date().getFullYear()

    // Mes anterior para comparativa
    const mesAnteriorNum = mes === 1 ? 12 : mes - 1
    const anioAnterior = mes === 1 ? anio - 1 : anio

    const [
      gastosFijos,
      gastosVariables,
      ingresos,
      gastosFijosAnt,
      gastosVariablesAnt,
      ingresosAnt,
    ] = await Promise.all([
      db.gastoFijo.findMany({ where: { usuarioId: usuario.id, mes, anio } }),
      db.gastoVariable.findMany({ where: { usuarioId: usuario.id, mes, anio } }),
      db.ingreso.findMany({ where: { usuarioId: usuario.id, mes, anio } }),
      db.gastoFijo.findMany({ where: { usuarioId: usuario.id, mes: mesAnteriorNum, anio: anioAnterior } }),
      db.gastoVariable.findMany({ where: { usuarioId: usuario.id, mes: mesAnteriorNum, anio: anioAnterior } }),
      db.ingreso.findMany({ where: { usuarioId: usuario.id, mes: mesAnteriorNum, anio: anioAnterior } }),
    ])

    // Totales mes actual
    const totalGastosFijos = gastosFijos.reduce((s, g) => s + g.monto, 0)
    const totalGastosVariables = gastosVariables.reduce((s, g) => s + g.monto, 0)
    const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0)
    const totalGastos = totalGastosFijos + totalGastosVariables
    const ahorro = totalIngresos - totalGastos

    // Totales mes anterior
    const totalGastosFijosAnt = gastosFijosAnt.reduce((s, g) => s + g.monto, 0)
    const totalGastosVariablesAnt = gastosVariablesAnt.reduce((s, g) => s + g.monto, 0)
    const totalIngresosAnt = ingresosAnt.reduce((s, i) => s + i.monto, 0)
    const totalGastosAnt = totalGastosFijosAnt + totalGastosVariablesAnt
    const ahorroAnt = totalIngresosAnt - totalGastosAnt

    // Gastos por categoría (fijos + variables combinados)
    const gastosPorCategoria: Record<string, number> = {}
    for (const g of [...gastosFijos, ...gastosVariables]) {
      gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + g.monto
    }

    // Ingresos por categoría
    const ingresosPorCategoria: Record<string, number> = {}
    for (const i of ingresos) {
      ingresosPorCategoria[i.categoria] = (ingresosPorCategoria[i.categoria] || 0) + i.monto
    }

    // Gastos por día del mes (para ver patrón)
    const gastosPorDia: Record<number, number> = {}
    for (const g of gastosVariables) {
      const dia = new Date(g.fecha).getDate()
      gastosPorDia[dia] = (gastosPorDia[dia] || 0) + g.monto
    }

    // Gastos fijos por estado
    const gastosFijosPagados = gastosFijos.filter(g => g.estado === 'pagado').reduce((s, g) => s + g.monto, 0)
    const gastosFijosPendientes = gastosFijos.filter(g => g.estado === 'pendiente').reduce((s, g) => s + g.monto, 0)

    // Variaciones porcentuales
    const calcVariacion = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0
      return Math.round(((actual - anterior) / anterior) * 100)
    }

    return NextResponse.json({
      mes,
      anio,
      resumen: {
        totalIngresos,
        totalGastos,
        totalGastosFijos,
        totalGastosVariables,
        ahorro,
        gastosFijosPagados,
        gastosFijosPendientes,
        balance: ahorro,
        // Comparativa
        variacionIngresos: calcVariacion(totalIngresos, totalIngresosAnt),
        variacionGastos: calcVariacion(totalGastos, totalGastosAnt),
        variacionAhorro: calcVariacion(ahorro, ahorroAnt),
        mesAnterior: {
          totalIngresos: totalIngresosAnt,
          totalGastos: totalGastosAnt,
          ahorro: ahorroAnt,
        },
      },
      gastosPorCategoria: Object.entries(gastosPorCategoria)
        .map(([categoria, monto]) => ({ categoria, monto }))
        .sort((a, b) => b.monto - a.monto),
      ingresosPorCategoria: Object.entries(ingresosPorCategoria)
        .map(([categoria, monto]) => ({ categoria, monto }))
        .sort((a, b) => b.monto - a.monto),
      gastosPorDia: Object.entries(gastosPorDia)
        .map(([dia, monto]) => ({ dia: Number(dia), monto }))
        .sort((a, b) => a.dia - b.dia),
      // Todos los movimientos del mes para búsqueda
      movimientos: [
        ...ingresos.map(i => ({
          id: i.id,
          tipo: 'ingreso' as const,
          concepto: i.concepto,
          categoria: i.categoria,
          monto: i.monto,
          fecha: i.fecha,
          extra: { esFijo: i.esFijo },
        })),
        ...gastosFijos.map(g => ({
          id: g.id,
          tipo: 'gasto_fijo' as const,
          concepto: g.concepto,
          categoria: g.categoria,
          monto: -g.monto,
          fecha: new Date(anio, mes - 1, g.diaVencimiento),
          extra: { estado: g.estado, diaVencimiento: g.diaVencimiento },
        })),
        ...gastosVariables.map(g => ({
          id: g.id,
          tipo: 'gasto_variable' as const,
          concepto: g.concepto,
          categoria: g.categoria,
          monto: -g.monto,
          fecha: g.fecha,
          extra: {},
        })),
      ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    })
  } catch (e: any) {
    if (e.name === 'UnauthorizedError') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    console.error('[GET /api/reportes]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
