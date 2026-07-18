'use client'

import { useAppStore } from '@/store/app'
import { useEffect } from 'react'

const TEMAS_VALIDOS = [
  'oscuro-premium',
  'claro-minimalista',
  'neon-futurista',
  'ocean-glass',
  'midnight-purple',
  'warm-sunset',
  'forest-green',
  'dark-cyber',
  'candy-pastel',
  'classic-gold',
  'aurora',
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const tema = useAppStore((s) => s.apariencia.tema)

  useEffect(() => {
    let temaFinal = tema
    if (!TEMAS_VALIDOS.includes(temaFinal)) temaFinal = 'oscuro-premium'
    document.documentElement.setAttribute('data-theme', temaFinal)
  }, [tema])

  return <>{children}</>
}