// LiderControl Chat Service - WebSocket con Socket.io
// Puerto 3003 — accedido vía gateway con ?XTransformPort=3003
//
// Seguridad:
// - CORS restringido a orígenes configurados via SOCKET_CORS_ORIGINS (coma-separado).
// - allowRequest valida el header Origin contra la lista permitida.
// - En desarrollo sin env, se permite solo localhost para no romper el flujo local.
//
// NOTA: Chat desactivado en la app. Este servicio queda disponible para cuando
// se reactive. Ver instrucciones en src/components/layout/sidebar.tsx.

import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT) || 3003

function getAllowedOrigins(): string[] {
  const raw = process.env.SOCKET_CORS_ORIGINS
  if (raw && raw.trim().length > 0) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SOCKET_CORS_ORIGINS no definido en producción. ' +
      'Setealo en .env con los orígenes permitidos separados por coma.'
    )
  }
  console.warn(
    '⚠️  SOCKET_CORS_ORIGINS no definido. Usando orígenes de desarrollo (localhost). ' +
    'NO usar en producción.'
  )
  return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:81']
}

const ALLOWED_ORIGINS = getAllowedOrigins()

const requestHandler = (req: any, res: any) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'lidercontrol-chat', port: PORT }))
    return
  }
  const url = req.url || ''
  const isSocketIo = url.startsWith('/wintexveo-ws')
  if (!isSocketIo) {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('LiderControl Chat Service OK')
    return
  }
}

const httpServer = createServer(requestHandler)

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/wintexveo-ws',
  allowRequest: (req, fn) => {
    const origin = req.headers.origin || req.headers.referer || ''
    if (!origin) {
      fn(null, false)
      return
    }
    const permitido = ALLOWED_ORIGINS.some((allowed) => {
      try {
        return new URL(origin).origin === new URL(allowed).origin
      } catch {
        return false
      }
    })
    fn(null, permitido)
  },
})

const usuariosConectados = new Map<string, { usuarioId: string; nombre: string }>()

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Socket conectado: ${socket.id}`)

  socket.on('registrar', (payload: { usuarioId: string; nombre: string }) => {
    usuariosConectados.set(socket.id, payload)
    socket.join(`usuario:${payload.usuarioId}`)
    console.log(`  → Registrado: ${payload.nombre} (${payload.usuarioId})`)
  })

  socket.on('mensaje:enviar', (payload: {
    destinatarioId: string
    remitenteId: string
    remitenteNombre: string
    mensaje: any
  }) => {
    console.log(`  → Mensaje de ${payload.remitenteNombre} → ${payload.destinatarioId}`)
    io.to(`usuario:${payload.destinatarioId}`).emit('mensaje:recibir', {
      mensaje: payload.mensaje,
      remitenteId: payload.remitenteId,
    })
    socket.emit('mensaje:confirmado', { mensaje: payload.mensaje })
  })

  socket.on('escribiendo', (payload: { destinatarioId: string; remitenteId: string }) => {
    io.to(`usuario:${payload.destinatarioId}`).emit('usuario:escribiendo', { remitenteId: payload.remitenteId })
  })

  socket.on('leer', (payload: { destinatarioId: string; remitenteId: string }) => {
    io.to(`usuario:${payload.remitenteId}`).emit('mensaje:leido', { destinatarioId: payload.destinatarioId })
  })

  socket.on('transferencia:actualizada', (payload: { destinatarioId: string }) => {
    io.to(`usuario:${payload.destinatarioId}`).emit('transferencia:actualizada', {})
  })

  socket.on('disconnect', () => {
    const user = usuariosConectados.get(socket.id)
    if (user) {
      console.log(`  → Desconectado: ${user.nombre}`)
      usuariosConectados.delete(socket.id)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 LiderControl Chat Service corriendo en puerto ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   Orígenes permitidos: ${ALLOWED_ORIGINS.join(', ')}`)
})
