'use client'

import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/store/app'
import { useEffect, useState } from 'react'

/**
 * Cliente Socket.io para LiderControl.
 *
 * Conexión vía Next.js proxy (/wintexveo-ws) → mini-servicio en puerto 3003.
 * El path DEBE coincidir exactamente con `path` del server (mini-services/chat-service/index.ts).
 *
 * NOTA: Chat desactivado temporalmente. Este módulo queda disponible para cuando
 * se reactive el chat. Ver instrucciones en src/components/layout/sidebar.tsx.
 */

let socket: Socket | null = null

export type MensajeSocket = {
  id: string
  remitenteId: string
  destinatarioId: string
  tipo: 'texto' | 'audio' | 'transferencia'
  contenido?: string
  transcripcion?: string
  duracionSeg?: number | null
  creadoEn: string
  remitente?: { id: string; nombre: string; color: string }
  transferencia?: any
}

export function getSocket(): Socket | null {
  return socket
}

export function initSocket(usuarioId: string, nombre: string): Socket | null {
  if (socket?.connected) return socket

  try {
    socket = io({
      path: '/wintexveo-ws',
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 8000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    })

    socket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Socket] Conectado:', socket?.id)
      }
      socket?.emit('registrar', { usuarioId, nombre })
    })

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Socket] Desconectado:', reason)
      }
    })

    socket.on('connect_error', (err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Socket] Error de conexión:', err.message)
      }
    })

    socket.on('reconnect', (attempt) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Socket] Reconectado en intento', attempt)
      }
      socket?.emit('registrar', { usuarioId, nombre })
    })
  } catch (e) {
    console.warn('[Socket] No se pudo inicializar')
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function emitMensaje(mensaje: MensajeSocket, destinatarioId: string, remitenteId: string, remitenteNombre: string) {
  socket?.emit('mensaje:enviar', { destinatarioId, remitenteId, remitenteNombre, mensaje })
}

export function emitEscribiendo(destinatarioId: string, remitenteId: string) {
  socket?.emit('escribiendo', { destinatarioId, remitenteId })
}

export function emitLeer(destinatarioId: string, remitenteId: string) {
  socket?.emit('leer', { destinatarioId, remitenteId })
}

export function emitTransferenciaActualizada(destinatarioId: string) {
  socket?.emit('transferencia:actualizada', { destinatarioId })
}

export function onMensajeRecibido(cb: (payload: { mensaje: MensajeSocket; remitenteId: string }) => void): () => void {
  if (!socket) return () => {}
  socket.on('mensaje:recibir', cb)
  return () => socket?.off('mensaje:recibir', cb)
}

export function onTransferenciaActualizada(cb: () => void): () => void {
  if (!socket) return () => {}
  socket.on('transferencia:actualizada', cb)
  return () => socket?.off('transferencia:actualizada', cb)
}

export function onMensajeLeido(cb: (payload: { destinatarioId: string }) => void): () => void {
  if (!socket) return () => {}
  socket.on('mensaje:leido', cb)
  return () => socket?.off('mensaje:leido', cb)
}

export function onUsuarioEscribiendo(cb: (payload: { remitenteId: string }) => void): () => void {
  if (!socket) return () => {}
  socket.on('usuario:escribiendo', cb)
  return () => socket?.off('usuario:escribiendo', cb)
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const { usuarioActivoId, usuarioActivoNombre } = useAppStore()

  useEffect(() => {
    if (!usuarioActivoId) return
    const s = initSocket(usuarioActivoId, usuarioActivoNombre)
    if (!s) return

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)

    if (s.connected) {
      Promise.resolve().then(() => setIsConnected(true))
    }

    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
    }
  }, [usuarioActivoId, usuarioActivoNombre])

  return { socket, isConnected }
}
