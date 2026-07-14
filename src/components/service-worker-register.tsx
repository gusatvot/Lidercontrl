'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker de LiderControl.
 * En Next.js 16 con React 19, los <script dangerouslySetInnerHTML> no se ejecutan
 * en el cliente. La forma correcta es un client component con useEffect.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        console.log('[SW] Registrado:', reg.scope)
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') window.location.reload()
          })
        })
      } catch (err) {
        console.warn('[SW] Error:', err)
      }
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }

    const onControllerChange = () => window.location.reload()
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      window.removeEventListener('load', register)
    }
  }, [])

  return null
}
