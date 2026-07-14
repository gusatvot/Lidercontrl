'use client'

import { useAppStore } from '@/store/app'
import { useEffect } from 'react'

const TEMAS_VALIDOS = ['oscuro-premium', 'claro-minimalista', 'neon-futurista']

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Suscribirse al tema del store - se re-renderiza cuando cambia
  const tema = useAppStore((s) => s.apariencia.tema)

  useEffect(() => {
    let temaFinal = tema
    if (!TEMAS_VALIDOS.includes(temaFinal)) temaFinal = 'oscuro-premium'
    document.documentElement.setAttribute('data-theme', temaFinal)
  }, [tema])

  return <>{children}</>
}
