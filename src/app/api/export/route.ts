// GET /api/export - Exporta todos los datos del usuario en CSV
// Formato: devuelve un CSV con todas las transacciones (ingresos, gastos fijos, variables, transferencias)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)

    const [cuenta, gastosFijos, gastosVariables, ingresos, metas, transferenciasEnviadas, transferenciasRecibidas] = await Promise.all([
      db.cuenta.findUnique({ where: { usuarioId: usuario.id } }),
      db.gastoFijo.findMany({ where: { usuarioId: usuario.id }, orderBy: [{ anio: 'desc' }, { mes: 'desc' }] }),
      db.gastoVariable.findMany({ where: { usuarioId: usuario.id }, orderBy: [{ anio: 'desc' }, { mes: 'desc' }] }),
      db.ingreso.findMany({ where: { usuarioId: usuario.id }, orderBy: [{ anio: 'desc' }, { mes: 'desc' }] }),
      db.metaAhorro.findMany({ where: { usuarioId: usuario.id }, orderBy: [{ anio: 'desc' }, { mes: 'desc' }] }),
      db.transferencia.findMany({
        where: { cuentaOrigenId: usuario.id },
        include: { cuentaDestino: { select: { nombre: true } } },
        orderBy: { creadoEn: 'desc' },
      }),
      db.transferencia.findMany({
        where: { cuentaDestinoId: usuario.id },
        include: { cuentaOrigen: { select: { nombre: true } } },
        orderBy: { creadoEn: 'desc' },
      }),
    ])

    // Tipamos como (string|number)[][] porque muchos valores son numéricos.
    const rows: (string | number)[][] = []

    // Encabezado
    rows.push(['LiderControl - Exportación de datos'])
    rows.push(['Usuario', usuario.nombre, 'Email', usuario.email])
    rows.push(['Fecha exportación', new Date().toLocaleString('es-AR')])
    rows.push([])

    // Resumen de cuenta
    rows.push(['=== RESUMEN DE CUENTA ==='])
    rows.push(['Saldo actual', cuenta?.saldo || 0])
    rows.push(['Ingreso mensual configurado', cuenta?.ingresoMensual || 0])
    rows.push(['Meta de ahorro mensual', cuenta?.metaAhorroMensual || 0])
    rows.push(['Presupuesto gastos variables', cuenta?.presupuestoVariables || 0])
    rows.push([])

    // Ingresos
    rows.push(['=== INGRESOS ==='])
    rows.push(['Fecha', 'Mes', 'Año', 'Concepto', 'Categoría', 'Monto', 'Es Fijo', 'Nota'])
    for (const i of ingresos) {
      rows.push([
        new Date(i.fecha).toLocaleDateString('es-AR'),
        i.mes, i.anio,
        i.concepto, i.categoria, i.monto,
        i.esFijo ? 'Sí' : 'No',
        i.nota || '',
      ])
    }
    rows.push([])

    // Gastos fijos
    rows.push(['=== GASTOS FIJOS ==='])
    rows.push(['Mes', 'Año', 'Concepto', 'Categoría', 'Monto', 'Día Vencimiento', 'Estado', 'Nota'])
    for (const g of gastosFijos) {
      rows.push([
        g.mes, g.anio,
        g.concepto, g.categoria, g.monto,
        g.diaVencimiento, g.estado,
        g.nota || '',
      ])
    }
    rows.push([])

    // Gastos variables
    rows.push(['=== GASTOS VARIABLES ==='])
    rows.push(['Fecha', 'Mes', 'Año', 'Concepto', 'Categoría', 'Monto'])
    for (const g of gastosVariables) {
      rows.push([
        new Date(g.fecha).toLocaleDateString('es-AR'),
        g.mes, g.anio,
        g.concepto, g.categoria, g.monto,
      ])
    }
    rows.push([])

    // Metas de ahorro
    rows.push(['=== METAS DE AHORRO ==='])
    rows.push(['Mes', 'Año', 'Título', 'Monto Objetivo', 'Monto Actual', 'Porcentaje'])
    for (const m of metas) {
      const pct = m.montoObjetivo > 0 ? ((m.montoActual / m.montoObjetivo) * 100).toFixed(1) : '0'
      rows.push([m.mes, m.anio, m.titulo, m.montoObjetivo, m.montoActual, `${pct}%`])
    }
    rows.push([])

    // Transferencias enviadas
    rows.push(['=== TRANSFERENCIAS ENVIADAS ==='])
    rows.push(['Fecha', 'Destinatario', 'Monto', 'Concepto', 'Estado'])
    for (const t of transferenciasEnviadas) {
      rows.push([
        new Date(t.creadoEn).toLocaleString('es-AR'),
        t.cuentaDestino?.nombre || 'Desconocido',
        t.monto, t.concepto, t.estado,
      ])
    }
    rows.push([])

    // Transferencias recibidas
    rows.push(['=== TRANSFERENCIAS RECIBIDAS ==='])
    rows.push(['Fecha', 'Remitente', 'Monto', 'Concepto', 'Estado'])
    for (const t of transferenciasRecibidas) {
      rows.push([
        new Date(t.creadoEn).toLocaleString('es-AR'),
        t.cuentaOrigen?.nombre || 'Desconocido',
        t.monto, t.concepto, t.estado,
      ])
    }

    const csv = rows.map(r => r.map(escapeCSV).join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lidercontrol_${usuario.nombre}_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (e: any) {
    console.error('[GET /api/export]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
