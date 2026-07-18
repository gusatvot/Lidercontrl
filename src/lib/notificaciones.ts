// LiderControl - Plantillas de email para notificaciones de vencimientos
import { NextRequest } from 'next/server'
import { sendEmail } from './email'

export interface GastoPorVencer {
  id: string
  concepto: string
  categoria: string
  monto: number
  diaVencimiento: number
  diasRestantes: number
  mes: number
  anio: number
}

export function calcularDiasVencimiento(diaVencimiento: number, mes: number, anio: number): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const diasEnMes = new Date(anio, mes, 0).getDate()
  const diaAjustado = Math.min(diaVencimiento, diasEnMes)
  const fechaVencimiento = new Date(anio, mes - 1, diaAjustado)
  fechaVencimiento.setHours(0, 0, 0, 0)
  const diffMs = fechaVencimiento.getTime() - hoy.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export function emailVencimientosHtml(
  nombre: string,
  gastos: GastoPorVencer[],
  periodo: { mes: number; anio: number }
): string {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const periodoStr = `${MESES[periodo.mes - 1]} ${periodo.anio}`

  const filas = gastos.map((g) => {
    const diasTexto = g.diasRestantes === 0 ? 'Hoy' : g.diasRestantes === 1 ? 'Mañana' : g.diasRestantes < 0 ? `Hace ${Math.abs(g.diasRestantes)} días` : `En ${g.diasRestantes} días`
    const color = g.diasRestantes < 0 ? '#f43f5e' : g.diasRestantes <= 1 ? '#f59e0b' : '#10b981'
    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="font-weight: 600; color: #e4e4e7;">${g.concepto}</div>
          <div style="font-size: 12px; color: #71717a; margin-top: 2px;">${g.categoria} - Vence día ${g.diaVencimiento}</div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right;">
          <div style="font-weight: 600; color: #e4e4e7;">$${g.monto.toLocaleString('es-AR')}</div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: ${color}20; color: ${color}; font-size: 11px; font-weight: 600; margin-top: 4px;">
            ${diasTexto}
          </div>
        </td>
      </tr>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Vencimientos próximos - LiderControl</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden;">
    <div style="padding: 24px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6);">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px;">⏰</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: white;">Vencimientos próximos</h1>
      </div>
      <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 14px;">${gastos.length} gasto${gastos.length === 1 ? '' : 's'} por vencer en ${periodoStr}</p>
    </div>
    <div style="padding: 24px 32px;">
      <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">Hola <strong style="color: #e4e4e7;">${nombre}</strong>,</p>
      <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0;">Estos son los gastos fijos pendientes que tenés que pagar pronto:</p>
      <table style="width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background: rgba(255,255,255,0.03);">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Concepto</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Monto</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <div style="margin-top: 20px; padding: 16px 20px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #a1a1aa; font-size: 14px;">Total a pagar</span>
          <span style="color: #e4e4e7; font-size: 18px; font-weight: 700;">$${gastos.reduce((s, g) => s + g.monto, 0).toLocaleString('es-AR')}</span>
        </div>
      </div>
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">Abrir LiderControl</a>
      </div>
    </div>
    <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2);">
      <p style="margin: 0; color: #71717a; font-size: 12px; line-height: 1.5;">
        Recibís este email porque tenés activadas las notificaciones de vencimientos en LiderControl.
        <br>Para desactivarlas, entrá a <strong>Ajustes → Notificaciones</strong>.
      </p>
    </div>
  </div>
</body></html>
  `
}

export function emailVencimientosText(
  nombre: string,
  gastos: GastoPorVencer[],
  periodo: { mes: number; anio: number }
): string {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const periodoStr = `${MESES[periodo.mes - 1]} ${periodo.anio}`
  let txt = `Hola ${nombre},\n\nTenés ${gastos.length} gasto${gastos.length === 1 ? '' : 's'} por vencer en ${periodoStr}:\n\n`
  for (const g of gastos) {
    const diasTexto = g.diasRestantes === 0 ? 'HOY' : g.diasRestantes === 1 ? 'MAÑANA' : g.diasRestantes < 0 ? `venció hace ${Math.abs(g.diasRestantes)} días` : `en ${g.diasRestantes} días`
    txt += `  • ${g.concepto} - $${g.monto.toLocaleString('es-AR')} (${diasTexto})\n`
  }
  txt += `\nTotal: $${gastos.reduce((s, g) => s + g.monto, 0).toLocaleString('es-AR')}\n\n`
  txt += `Abrí LiderControl para registrar los pagos.\n`
  return txt
}

export async function enviarNotificacionVencimientos(
  req: NextRequest | null,
  usuario: { nombre: string; email: string },
  gastos: GastoPorVencer[],
  periodo: { mes: number; anio: number }
): Promise<{ success: boolean; error?: string }> {
  const result = await sendEmail(req, {
    to: usuario.email,
    subject: `⏰ Tenés ${gastos.length} gasto${gastos.length === 1 ? '' : 's'} por vencer`,
    html: emailVencimientosHtml(usuario.nombre, gastos, periodo),
    text: emailVencimientosText(usuario.nombre, gastos, periodo),
  })
  return { success: result.success, error: result.error }
}