// POST /api/audios
// Recibe audio base64, lo guarda en /public/audios, lo transcribe con ASR
// Retorna { url, transcripcion, duracionSeg }

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUsuarioActivo, UnauthorizedError } from '@/lib/session'
import { createMensajeSchema } from '@/lib/validations'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioActivo(req)
    const body = await req.json()
    const { destinatarioId, audioBase64, duracionSeg, formato = 'webm' } = body

    if (!destinatarioId || !audioBase64) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }
    if (destinatarioId === usuario.id) {
      return NextResponse.json({ error: 'No podés enviarte un mensaje a vos mismo' }, { status: 400 })
    }

    // 1. Guardar archivo de audio
    const nombreArchivo = `audio_${Date.now()}_${usuario.id}.${formato}`
    const rutaArchivo = path.join(process.cwd(), 'public', 'audios', nombreArchivo)
    const buffer = Buffer.from(audioBase64, 'base64')
    fs.writeFileSync(rutaArchivo, buffer)

    // 2. Transcribir con ASR (z-ai-web-dev-sdk, server-side only)
    let transcripcion = ''
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const response = await zai.audio.asr.create({
        file_base64: audioBase64,
      })
      transcripcion = response.text || ''
    } catch (asrErr) {
      console.error('[ASR] Error transcribiendo:', asrErr)
      // No fallar el mensaje si la transcripción falla
      transcripcion = '(No se pudo transcribir el audio)'
    }

    // 3. Crear mensaje tipo audio
    const mensaje = await db.mensaje.create({
      data: {
        remitenteId: usuario.id,
        destinatarioId,
        tipo: 'audio',
        contenido: `/audios/${nombreArchivo}`,
        transcripcion,
        duracionSeg: duracionSeg || null,
      },
      include: {
        remitente: { select: { id: true, nombre: true, color: true } },
        transferencia: true,
      },
    })

    return NextResponse.json(mensaje, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/audios]', e)
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
