'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app'

export function useKeyboardShortcuts() {
  const { setCmdkOpen, abrirGastoDialog, abrirIngresoDialog, setSeccion } = useAppStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input/textarea
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT'

      // CMD+K / Ctrl+K → paleta
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdkOpen(true)
        return
      }

      // CMD+Shift+C → chat (desactivado)
      // if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
      //   e.preventDefault()
      //   setSeccion('chat')
      //   return
      // }

      // Si está escribiendo, no procesar más
      if (isTyping) return

      // N → nuevo gasto diario (variable)
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        abrirGastoDialog('variable')
        return
      }

      // F → nuevo gasto fijo
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        abrirGastoDialog('fijo')
        return
      }

      // V → nuevo gasto variable (alias)
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault()
        abrirGastoDialog('variable')
        return
      }

      // I → nuevo ingreso
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        abrirIngresoDialog()
        return
      }

      // D → dashboard
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setSeccion('dashboard')
        return
      }

      // C → chat (desactivado)
      // if (e.key === 'c' || e.key === 'C') {
      //   e.preventDefault()
      //   setSeccion('chat')
      //   return
      // }

      // A → ajustes
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setSeccion('ajustes')
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCmdkOpen, abrirGastoDialog, abrirIngresoDialog, setSeccion])
}
