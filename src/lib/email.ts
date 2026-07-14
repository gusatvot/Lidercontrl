// LiderControl - Cliente de email con Resend (production) + fallback dev.
import { NextRequest } from 'next/server'

export interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface SendResult {
  success: boolean
  devUrl?: string
  error?: string
}

export async function sendEmail(req: NextRequest | null, params: EmailParams): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'LiderControl <onboarding@resend.dev>'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Email] RESEND_API_KEY no configurado en producción')
      return { success: false, error: 'Servidor de email no configurado' }
    }
    console.log('\n========== 📧 EMAIL (MODO DEV) ==========')
    console.log(`To: ${params.to}`)
    console.log(`From: ${from}`)
    console.log(`Subject: ${params.subject}`)
    console.log('---')
    console.log(params.text || params.html.replace(/<[^>]+>/g, ''))
    console.log('==========================================\n')
    return { success: true, devUrl: '(dev mode - link logueado arriba)' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [params.to], subject: params.subject, html: params.html, text: params.text }),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[Email] Resend error:', res.status, errText)
      return { success: false, error: `Resend ${res.status}: ${errText}` }
    }
    return { success: true }
  } catch (e: any) {
    console.error('[Email] Error enviando:', e)
    return { success: false, error: e.message }
  }
}

export function emailVerificacionHtml(nombre: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Verificá tu cuenta en LiderControl</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); margin-bottom: 16px;"></div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Verificá tu email</h1>
    </div>
    <p style="color: #a1a1aa; line-height: 1.6;">Hola <strong style="color: #e4e4e7;">${nombre}</strong>,</p>
    <p style="color: #a1a1aa; line-height: 1.6;">Bienvenido a LiderControl. Para empezar a usar tu cuenta, necesitamos verificar tu dirección de email.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">Verificar mi email</a>
    </div>
    <p style="color: #71717a; font-size: 13px; line-height: 1.5;">O copiá este link en tu navegador:</p>
    <p style="color: #6366f1; font-size: 12px; word-break: break-all; background: rgba(99,102,241,0.08); padding: 10px; border-radius: 8px;">${verificationUrl}</p>
    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;">
    <p style="color: #71717a; font-size: 12px; line-height: 1.5;">Si no creaste esta cuenta, ignorá este email. El link expira en 24 horas.</p>
  </div>
</body></html>`
}

export function emailVerificacionText(nombre: string, verificationUrl: string): string {
  return `Hola ${nombre},\n\nBienvenido a LiderControl. Verificá tu email abriendo este link:\n\n${verificationUrl}\n\nEl link expira en 24 horas. Si no creaste esta cuenta, ignorá este email.`
}
