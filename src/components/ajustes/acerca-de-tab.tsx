'use client'

import { motion } from 'framer-motion'
import { Info, Code, Zap, Github, Mail, ExternalLink, Heart } from 'lucide-react'

export function AcercaDeTab() {
  const techs = [
    { nombre: 'Next.js 16', color: '#6366f1' },
    { nombre: 'TypeScript', color: '#3178c6' },
    { nombre: 'Tailwind CSS 4', color: '#06b6d4' },
    { nombre: 'Shadcn/UI', color: '#fff' },
    { nombre: 'Prisma ORM', color: '#10b981' },
    { nombre: 'SQLite', color: '#0ea5e9' },
    { nombre: 'TanStack Query', color: '#f43f5e' },
    { nombre: 'Zustand', color: '#f59e0b' },
    { nombre: 'React Hook Form', color: '#ec4899' },
    { nombre: 'Zod', color: '#8b5cf6' },
    { nombre: 'Framer Motion', color: '#a78bfa' },
    { nombre: 'Socket.io', color: '#84cc16' },
  ]

  const features = [
    'Dashboard con distribución 50/30/20 personalizable',
    'CRUD de gastos fijos y variables con UI optimista',
    'Ingresos extras y recurrentes con categorías',
    'Chat familiar en tiempo real con Socket.io',
    'Mensajes de audio con transcripción automática (ASR)',
    'Transferencias entre usuarios con estados',
    'Multi-usuario con registro y verificación por email',
    'Paleta de comandos CMD+K con atajos de teclado',
    'Método bola de nieve para pago de deudas',
    'Metas de ahorro con seguimiento de progreso',
    'Exportación de datos a CSV',
    'Tema oscuro + 5 colores de acento',
  ]

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-3xl p-8 glass text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: '#6366f1' }} />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: '#8b5cf6' }} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            <Zap className="w-8 h-8 text-[var(--foreground)]" fill="white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">LiderControl</h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">Finanzas familiares inteligentes</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--secondary)] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            Versión 1.0.0 · Julio 2026
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
            <Info className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Características</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Todo lo que podés hacer en LiderControl</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 p-2 text-sm"
            >
              <span className="text-[var(--chart-3)] mt-0.5">✓</span>
              <span>{f}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tecnologías */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
            <Code className="w-5 h-5 text-[var(--chart-2)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Stack tecnológico</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Construido con herramientas modernas</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {techs.map((t) => (
            <span
              key={t.nombre}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: `${t.color}15`,
                color: t.color,
                border: `1px solid ${t.color}30`,
              }}
            >
              {t.nombre}
            </span>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <Mail className="w-5 h-5 text-[var(--chart-3)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Soporte y contacto</h2>
            <p className="text-xs text-[var(--muted-foreground)]">¿Necesitás ayuda o querés reportar un bug?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-[var(--secondary)] transition-all cursor-pointer"
          >
            <Github className="w-5 h-5 text-[var(--muted-foreground)]" />
            <div>
              <div className="text-sm font-medium">GitHub</div>
              <div className="text-xs text-[var(--muted-foreground)]">Reportar issues / contribuir</div>
            </div>
            <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)] ml-auto" />
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-[var(--secondary)] transition-all cursor-pointer"
          >
            <Mail className="w-5 h-5 text-[var(--muted-foreground)]" />
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-xs text-[var(--muted-foreground)]">soporte@lidercontrol.com</div>
            </div>
            <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)] ml-auto" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <div className="text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-1.5">
          Hecho con <Heart className="w-3 h-3 text-[var(--destructive)]" fill="currentColor" /> por la familia · LiderControl © 2026
        </div>
      </div>
    </div>
  )
}
