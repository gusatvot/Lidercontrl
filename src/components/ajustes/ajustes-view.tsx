'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { User, Wallet, Palette, Users, Bell, Database, Info, Tag } from 'lucide-react'
import { PerfilTab } from './perfil-tab'
import { CuentaTab } from './cuenta-tab'
import { AparienciaTab } from './apariencia-tab'
import { FamiliaTab } from './familia-tab'
import { NotificacionesTab } from './notificaciones-tab'
import { DatosTab } from './datos-tab'
import { AcercaDeTab } from './acerca-de-tab'
import { CategoriasTab } from './categorias-tab'

type Tab = 'perfil' | 'cuenta' | 'apariencia' | 'familia' | 'categorias' | 'notificaciones' | 'datos' | 'acerca'

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'cuenta', label: 'Cuenta', icon: Wallet },
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'familia', label: 'Familia', icon: Users },
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'datos', label: 'Datos', icon: Database },
  { id: 'acerca', label: 'Acerca de', icon: Info },
]

export function AjustesView() {
  const [tab, setTab] = useState<Tab>('perfil')

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Sidebar de tabs */}
      <aside className="col-span-12 md:col-span-3">
        <div className="rounded-3xl p-3 glass sticky top-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all whitespace-nowrap shrink-0',
                    active
                      ? 'bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.1)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Contenido del tab */}
      <div className="col-span-12 md:col-span-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'perfil' && <PerfilTab />}
            {tab === 'cuenta' && <CuentaTab />}
            {tab === 'apariencia' && <AparienciaTab />}
            {tab === 'familia' && <FamiliaTab />}
            {tab === 'categorias' && <CategoriasTab />}
            {tab === 'notificaciones' && <NotificacionesTab />}
            {tab === 'datos' && <DatosTab />}
            {tab === 'acerca' && <AcercaDeTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
