// LiderControl Service Worker - PWA offline support
const CACHE_NAME = 'lidercontrol-v8'
const STATIC_CACHE = 'lidercontrol-static-v6'

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignorar errores de recursos que no existan
      })
    })
  )
  // Forzar activación inmediata
  self.skipWaiting()
})

// Activar y limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      // Forzar a los clientes a recargar
      return self.clients.matchAll()
    }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'CACHE_UPDATED' })
      })
    })
  )
  self.clients.claim()
})

// Estrategia: Network First para APIs, Cache First para estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo manejar GET
  if (request.method !== 'GET') return

  // Ignorar requests de Next.js HMR y auth
  if (url.pathname.startsWith('/_next/webpack-hmr')) return
  if (url.pathname.startsWith('/api/auth')) return

  // Ignorar requests de extensiones del navegador y otros protocolos
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return
  if (url.hostname.includes('chrome-extension')) return

  // APIs: Network First con fallback a cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback a cache
          return caches.match(request)
        })
    )
    return
  }

  // Estáticos y páginas: Network First para HTML, Cache First para assets
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    // HTML: siempre ir a la red primero
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      }).catch(() => caches.match(request))
    )
    return
  }

  // Assets estáticos: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})
