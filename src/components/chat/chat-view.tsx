'use client'

import { useConversaciones, useMensajes, useEnviarMensaje, useEnviarAudio, useTransferir, useProcesarTransferencia } from '@/hooks/use-data'
import { useAppStore } from '@/store/app'
import { cn } from '@/lib/utils'
import { formatCurrency, formatTime, formatDuration, getInitials } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, X, Play, Pause, ArrowLeft, Users, CircleDollarSign, Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ChatView() {
  const { contactoActivoId, setContactoActivo, usuarioActivoId } = useAppStore()
  const { data: conversaciones, isLoading: loadingConv } = useConversaciones()
  // El chat usa polling HTTP (refetch cada 5s en useMensajes, cada 10s en useConversaciones)
  // El socket queda disponible pero no es necesario para el funcionamiento básico

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100vh-180px)]">
      {/* Lista de contactos */}
      <div
        className={cn(
          'col-span-12 md:col-span-4 lg:col-span-3 rounded-3xl glass overflow-hidden flex flex-col',
          contactoActivoId && 'hidden md:flex'
        )}
      >
        <div className="p-5 border-b border-[var(--border)]">
          <div className="text-base font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            Conversaciones
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loadingConv ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl m-1 shimmer" />
            ))
          ) : (conversaciones || []).length === 0 ? (
            <div className="text-xs text-[var(--muted-foreground)] py-12 text-center px-4">
              No tenés conversaciones aún. ¡Empezá a chatear!
            </div>
          ) : (
            (conversaciones || []).map((conv: any) => (
              <ContactItem
                key={conv.contacto.id}
                contacto={conv.contacto}
                ultimoMensaje={conv.ultimoMensaje}
                noLeidos={conv.noLeidos}
                activo={conv.contacto.id === contactoActivoId}
                onClick={() => setContactoActivo(conv.contacto.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Ventana de conversación */}
      <div
        className={cn(
          'col-span-12 md:col-span-8 lg:col-span-9 rounded-3xl glass overflow-hidden flex flex-col',
          !contactoActivoId && 'hidden md:flex'
        )}
      >
        {contactoActivoId ? (
          <Conversation contactoId={contactoActivoId} onBack={() => setContactoActivo(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
            <Users className="w-12 h-12 mb-3 opacity-50" />
            <div className="text-sm">Seleccioná una conversación</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ContactItem({ contacto, ultimoMensaje, noLeidos, activo, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer',
        activo
          ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
          : 'hover:bg-[var(--muted)]'
      )}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
        style={{ background: `${contacto.color}25`, color: contacto.color }}
      >
        {getInitials(contacto.nombre)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{contacto.nombre}</span>
          {ultimoMensaje && (
            <span className="text-[0.65rem] text-[var(--muted-foreground)]">
              {formatTime(ultimoMensaje.creadoEn)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)] truncate flex-1">
            {ultimoMensaje?.tipo === 'audio' && '🎤 Audio'}
            {ultimoMensaje?.tipo === 'transferencia' && '💸 Transferencia'}
            {ultimoMensaje?.tipo === 'texto' && (
              <>
                {ultimoMensaje.remitenteId === contacto.id ? '' : 'Vos: '}
                {ultimoMensaje.contenido}
              </>
            )}
          </span>
          {noLeidos > 0 && (
            <span className="bg-[#6366f1] text-[var(--foreground)] text-[0.65rem] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              {noLeidos}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function Conversation({ contactoId, onBack }: { contactoId: string; onBack: () => void }) {
  const { data: mensajes, isLoading } = useMensajes(contactoId)
  const { data: conversaciones } = useConversaciones()
  const enviarMensaje = useEnviarMensaje()
  const enviarAudio = useEnviarAudio()
  const transferir = useTransferir()
  const procesar = useProcesarTransferencia()
  const { usuarioActivoId, usuarioActivoColor, usuarioActivoNombre } = useAppStore()

  const [texto, setTexto] = useState('')
  const [grabando, setGrabando] = useState(false)
  const [duracionGrabacion, setDuracionGrabacion] = useState(0)
  const [showTransfer, setShowTransfer] = useState(false)
  const [montoTransfer, setMontoTransfer] = useState('')
  const [conceptoTransfer, setConceptoTransfer] = useState('')
  const [reproduciendo, setReproduciendo] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const contacto = (conversaciones || []).find((c: any) => c.contacto.id === contactoId)?.contacto

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes])

  // Cleanup grabación
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const enviarTexto = async () => {
    if (!texto.trim()) return
    const t = texto.trim()
    setTexto('')
    await enviarMensaje.mutateAsync({
      destinatarioId: contactoId,
      tipo: 'texto',
      contenido: t,
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1]
          try {
            await enviarAudio.mutateAsync({
              destinatarioId: contactoId,
              audioBase64: base64,
              duracionSeg: duracionGrabacion,
              formato: 'webm',
            })
          } catch (e) {
            // toast lo maneja el hook
          }
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mr.start()
      setGrabando(true)
      setDuracionGrabacion(0)
      timerRef.current = setInterval(() => {
        setDuracionGrabacion((d) => d + 1)
      }, 1000)
    } catch (e: any) {
      toast.error('No se pudo acceder al micrófono: ' + e.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setGrabando(false)
  }

  const enviarTransferencia = async () => {
    const monto = parseFloat(montoTransfer)
    if (!monto || monto <= 0) {
      toast.error('Ingresá un monto válido')
      return
    }
    if (!conceptoTransfer.trim()) {
      toast.error('Ingresá un concepto')
      return
    }
    try {
      await transferir.mutateAsync({
        destinatarioId: contactoId,
        monto,
        concepto: conceptoTransfer.trim(),
      })
      setMontoTransfer('')
      setConceptoTransfer('')
      setShowTransfer(false)
    } catch (e) {
      // toast lo maneja el hook
    }
  }

  const togglePlay = (audioUrl: string, id: string) => {
    if (reproduciendo === id) {
      audioRef.current?.pause()
      setReproduciendo(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(audioUrl)
      audio.onended = () => setReproduciendo(null)
      audio.play()
      audioRef.current = audio
      setReproduciendo(id)
    }
  }

  return (
    <>
      {/* Header conversación */}
      <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-1 rounded-lg hover:bg-[var(--secondary)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
          style={{ background: `${contacto?.color}25`, color: contacto?.color }}
        >
          {contacto ? getInitials(contacto.nombre) : '?'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{contacto?.nombre}</div>
          <div className="text-[0.7rem] text-[var(--chart-3)]">● En línea</div>
        </div>
        <button
          onClick={() => setShowTransfer(true)}
          className="p-2 rounded-lg hover:bg-[var(--secondary)] cursor-pointer text-[var(--chart-3)]"
          title="Enviar dinero"
        >
          <CircleDollarSign className="w-5 h-5" />
        </button>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-12 w-1/2 rounded-2xl shimmer" />)
        ) : (mensajes || []).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] text-sm">
            <Users className="w-10 h-10 mb-2 opacity-40" />
            Sin mensajes. Escribí algo para empezar.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {(mensajes || []).map((m: any) => {
              const esMio = m.remitenteId === usuarioActivoId
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                >
                  <MessageBubble
                    mensaje={m}
                    esMio={esMio}
                    miColor={usuarioActivoColor}
                    contactoColor={contacto?.color || '#8b5cf6'}
                    reproduciendo={reproduciendo}
                    onTogglePlay={(url: string) => togglePlay(url, m.id)}
                    onProcesar={(accion: 'aceptar' | 'rechazar') =>
                      procesar.mutate({ id: m.transferencia?.id, accion })
                    }
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)]">
        {grabando ? (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.3)]">
            <div className="w-3 h-3 rounded-full bg-[#f43f5e] animate-pulse" />
            <span className="text-sm font-medium text-[var(--destructive)] tabular">
              Grabando... {formatDuration(duracionGrabacion)}
            </span>
            <div className="flex-1" />
            <button
              onClick={stopRecording}
              className="px-3 py-1.5 rounded-lg bg-[#f43f5e] text-[var(--foreground)] text-xs font-semibold hover:bg-[#f43f5e]/80 cursor-pointer flex items-center gap-1.5"
            >
              {enviarAudio.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Enviar
            </button>
            <button
              onClick={() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                  mediaRecorderRef.current.stop()
                }
                if (timerRef.current) clearInterval(timerRef.current)
                setGrabando(false)
              }}
              className="p-1.5 rounded-lg hover:bg-[var(--secondary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={startRecording}
              className="p-2.5 rounded-xl hover:bg-[var(--secondary)] cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Grabar audio"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviarTexto()
                }
              }}
              placeholder="Escribí un mensaje..."
              className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
            <button
              onClick={enviarTexto}
              disabled={!texto.trim() || enviarMensaje.isPending}
              className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all"
            >
              {enviarMensaje.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal transferencia */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent className="glass-strong border-[var(--border)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-[var(--chart-3)]" />
              Enviar dinero a {contacto?.nombre}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Ingresá el monto y concepto para enviar una transferencia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto (ARS)</Label>
              <Input
                id="monto"
                type="number"
                placeholder="0"
                value={montoTransfer}
                onChange={(e) => setMontoTransfer(e.target.value)}
                className="bg-[var(--muted)] border-[var(--border)] tabular text-lg"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto</Label>
              <Input
                id="concepto"
                placeholder="Ej: Mitad del colegio"
                value={conceptoTransfer}
                onChange={(e) => setConceptoTransfer(e.target.value)}
                className="bg-[var(--muted)] border-[var(--border)]"
              />
            </div>
            <div className="text-[0.7rem] text-[var(--muted-foreground)] flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                La transferencia quedará <strong>pendiente</strong> hasta que {contacto?.nombre} la acepte.
                Se descontará de tu saldo al completarse.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTransfer(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              onClick={enviarTransferencia}
              disabled={transferir.isPending}
              className="bg-gradient-to-br from-[#10b981] to-[#34d399] hover:from-[#10b981]/80 hover:to-[#34d399]/80 cursor-pointer"
            >
              {transferir.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enviar ${montoTransfer || '0'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MessageBubble({
  mensaje,
  esMio,
  miColor,
  contactoColor,
  reproduciendo,
  onTogglePlay,
  onProcesar,
}: any) {
  const color = esMio ? miColor : contactoColor
  const hora = formatTime(mensaje.creadoEn)

  // Mensaje de transferencia
  if (mensaje.tipo === 'transferencia' && mensaje.transferencia) {
    const t = mensaje.transferencia
    return (
      <div className="max-w-[85%] sm:max-w-[320px]">
        <div
          className={cn(
            'rounded-2xl p-4 border',
            esMio ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(99,102,241,0.08)] border-[rgba(99,102,241,0.2)]'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <CircleDollarSign className="w-4 h-4 text-[var(--chart-3)]" />
            <span className="text-xs font-semibold text-[var(--chart-3)]">
              {esMio ? 'Enviaste' : 'Recibiste'} una transferencia
            </span>
          </div>
          <div className="text-2xl font-bold tabular">
            ${t.monto.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">{t.concepto}</div>

          {/* Estado */}
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <EstadoBadge estado={t.estado} />
            <span className="text-[0.65rem] text-[var(--muted-foreground)]">{hora}</span>
          </div>

          {/* Acciones si soy destinatario y está pendiente */}
          {!esMio && t.estado === 'pendiente' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onProcesar('aceptar')}
                className="flex-1 py-2 rounded-lg bg-[#10b981] text-[var(--foreground)] text-xs font-semibold hover:bg-[#10b981]/80 cursor-pointer"
              >
                Aceptar
              </button>
              <button
                onClick={() => onProcesar('rechazar')}
                className="flex-1 py-2 rounded-lg bg-[rgba(244,63,94,0.15)] text-[var(--destructive)] text-xs font-semibold hover:bg-[rgba(244,63,94,0.25)] cursor-pointer"
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mensaje de audio
  if (mensaje.tipo === 'audio') {
    return (
      <div className="max-w-[85%] sm:max-w-[320px]">
        <div
          className={cn(
            'rounded-2xl p-3 flex items-center gap-3',
            esMio ? 'bg-[rgba(99,102,241,0.15)]' : 'bg-[var(--secondary)]'
          )}
          style={esMio ? { boxShadow: `inset 0 0 0 1px ${color}30` } : {}}
        >
          <button
            onClick={() => onTogglePlay(mensaje.contenido)}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0"
            style={{ background: color }}
          >
            {reproduciendo === mensaje.id ? (
              <Pause className="w-4 h-4 text-[var(--foreground)]" fill="white" />
            ) : (
              <Play className="w-4 h-4 text-[var(--foreground)]" fill="white" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium mb-1">
              {mensaje.duracionSeg ? formatDuration(mensaje.duracionSeg) : '0:00'}
            </div>
            {/* Waveform mock */}
            <div className="flex items-center gap-0.5 h-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{
                    height: `${Math.sin(i * 0.7) * 8 + 12}px`,
                    background: color,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
            {mensaje.transcripcion && (
              <div className="text-[0.7rem] text-[var(--muted-foreground)] mt-2 italic">
                "{mensaje.transcripcion}"
              </div>
            )}
          </div>
        </div>
        <div className={cn('flex items-center gap-1 mt-1 text-[0.65rem] text-[var(--muted-foreground)]', esMio ? 'justify-end' : 'justify-start')}>
          <span>{hora}</span>
          {esMio && (mensaje.leido ? <CheckCheck className="w-3 h-3 text-[var(--primary)]" /> : <Check className="w-3 h-3" />)}
        </div>
      </div>
    )
  }

  // Mensaje de texto
  return (
    <div className="max-w-[85%] sm:max-w-[420px]">
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm break-words',
          esMio
            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] text-[var(--foreground)]'
            : 'bg-[var(--secondary)] text-[var(--foreground)]'
        )}
      >
        {mensaje.contenido}
      </div>
      <div className={cn('flex items-center gap-1 mt-1 text-[0.65rem] text-[var(--muted-foreground)]', esMio ? 'justify-end' : 'justify-start')}>
        <span>{hora}</span>
        {esMio && (mensaje.leido ? <CheckCheck className="w-3 h-3 text-[var(--primary)]" /> : <Check className="w-3 h-3" />)}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pendiente: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Pendiente' },
    aceptada: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Aceptada' },
    completada: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Completada' },
    rechazada: { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', label: 'Rechazada' },
  }
  const s = styles[estado] || styles.pendiente
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[0.65rem] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
