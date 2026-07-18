'use client'

import { useAppStore, COLORES_ACCENTO, type Tema, type Densidad, type FormatoMoneda } from '@/store/app'
import { setFormatoMonedaGlobal } from '@/lib/format'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper para aplicar formato al instante
function aplicarFormato(formato: string) {
  setFormatoMonedaGlobal(formato as any)
}

export function AparienciaTab() {
  const { apariencia, setApariencia } = useAppStore()

  const temas: { id: Tema; label: string; descripcion: string; colores: string[] }[] = [
    { id: 'oscuro-premium', label: 'Oscuro Premium', descripcion: 'Negro profundo con índigo y violeta', colores: ['#070708', '#6366f1', '#8b5cf6'] },
    { id: 'claro-minimalista', label: 'Claro Minimalista', descripcion: 'Blanco limpio con esmeralda', colores: ['#f8f9fa', '#10b981', '#34d399'] },
    { id: 'neon-futurista', label: 'Neón Futurista', descripcion: 'Azul marino con neón cyan', colores: ['#0a0e27', '#00d4ff', '#7c3aed'] },
    { id: 'ocean-glass', label: 'Ocean Glass', descripcion: 'Azul oceánico con glassmorphism', colores: ['#0c1929', '#06b6d4', '#14b8a6'] },
    { id: 'midnight-purple', label: 'Midnight Purple', descripcion: 'Púrpura profundo con rosa neón', colores: ['#0d0518', '#ec4899', '#a855f7'] },
    { id: 'warm-sunset', label: 'Warm Sunset', descripcion: 'Cálido con naranjas y dorados', colores: ['#1a0f08', '#f97316', '#fbbf24'] },
    { id: 'forest-green', label: 'Forest Green', descripcion: 'Verde bosque con dorado', colores: ['#0a1f14', '#22c55e', '#eab308'] },
    { id: 'dark-cyber', label: 'Dark Cyber', descripcion: 'Negro puro con neón verde', colores: ['#000000', '#00ff9f', '#00d4ff'] },
    { id: 'candy-pastel', label: 'Candy Pastel', descripcion: 'Pasteles suaves rosa y lila', colores: ['#fef3f7', '#ec4899', '#a855f7'] },
    { id: 'classic-gold', label: 'Classic Gold', descripcion: 'Negro elegante con dorado', colores: ['#0a0a0a', '#eab308', '#fbbf24'] },
    { id: 'aurora', label: 'Aurora', descripcion: 'Multicolor con gradientes vibrantes', colores: ['#050516', '#8b5cf6', '#ec4899'] },
  ]

  const densidades: { id: Densidad; label: string; descripcion: string }[] = [
    { id: 'comoda', label: 'Cómoda', descripcion: 'Más espacio, ideal para uso diario' },
    { id: 'compacta', label: 'Compacta', descripcion: 'Más info por pantalla' },
  ]

  const formatos: { id: FormatoMoneda; label: string; ejemplo: string }[] = [
    { id: 'completo', label: 'Completo', ejemplo: '$1.234.567' },
    { id: 'compacto', label: 'Compacto', ejemplo: '$1.2M' },
    { id: 'decimales', label: 'Con decimales', ejemplo: '$1.234,57' },
  ]

  return (
    <div className="space-y-5">
      {/* Tema */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Tema</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Apariencia general de la app</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {temas.map((t) => {
            const active = apariencia.tema === t.id
            return (
              <button
                key={t.id}
                onClick={() => setApariencia({ tema: t.id })}
                className={cn(
                  'p-5 rounded-2xl border transition-all cursor-pointer text-left',
                  active
                    ? 'border-[var(--primary)] bg-[var(--accent)]'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                )}
              >
                {/* Preview de colores */}
                <div className="flex gap-1.5 mb-3">
                  {t.colores.map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg"
                      style={{ background: c, boxShadow: i > 0 ? `0 0 10px ${c}80` : 'none' }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{t.descripcion}</div>
                  </div>
                  {active && <Check className="w-4 h-4 text-[var(--primary)]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Color de acento */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--chart-2)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Color de acento</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Color principal de botones, links y highlights</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {(Object.keys(COLORES_ACCENTO) as any[]).map((id) => {
            const c = COLORES_ACCENTO[id]
            const active = apariencia.colorAcento === id
            return (
              <button
                key={id}
                onClick={() => setApariencia({ colorAcento: id })}
                className={cn(
                  'p-4 rounded-2xl border transition-all cursor-pointer',
                  active
                    ? 'border-white/30 scale-105'
                    : 'border-[var(--border)] hover:border-white/20'
                )}
                style={{
                  background: `linear-gradient(135deg, ${c.primario}25, ${c.secundario}15)`,
                }}
              >
                <div
                  className="w-10 h-10 mx-auto rounded-full mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${c.primario}, ${c.secundario})`,
                    boxShadow: `0 0 20px ${c.primario}80`,
                  }}
                />
                <div className="text-xs font-medium text-center">{c.nombre}</div>
                {active && (
                  <Check className="w-3 h-3 mx-auto mt-1 text-[var(--foreground)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Densidad */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--chart-3)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Densidad</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Espaciado y tamaño de los elementos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {densidades.map((d) => {
            const active = apariencia.densidad === d.id
            return (
              <button
                key={d.id}
                onClick={() => setApariencia({ densidad: d.id })}
                className={cn(
                  'p-5 rounded-2xl border transition-all cursor-pointer text-left',
                  active
                    ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] border-[rgba(99,102,241,0.3)]'
                    : 'glass border-[var(--border)] hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">{d.label}</div>
                  {active && <Check className="w-4 h-4 text-[var(--primary)]" />}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">{d.descripcion}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Formato de moneda */}
      <div className="rounded-3xl p-6 glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(245,158,11,0.15)] flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--chart-4)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Formato de moneda</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Cómo se muestran los montos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {formatos.map((f) => {
            const active = apariencia.formatoMoneda === f.id
            return (
              <button
                key={f.id}
                onClick={() => { setApariencia({ formatoMoneda: f.id }); aplicarFormato(f.id) }}
                className={cn(
                  'p-5 rounded-2xl border transition-all cursor-pointer text-left',
                  active
                    ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] border-[rgba(99,102,241,0.3)]'
                    : 'glass border-[var(--border)] hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">{f.label}</div>
                  {active && <Check className="w-4 h-4 text-[var(--primary)]" />}
                </div>
                <div className="text-base font-bold tabular">{f.ejemplo}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
