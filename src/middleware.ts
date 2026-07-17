// LiderControl - Middleware de seguridad
// Rate limiting en /api/auth/* (10 intentos/min por IP) para mitigar brute-force.
import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 1000
const AUTH_MAX = 10

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(key: string, max: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const current = RATE_LIMIT.get(key)
  if (!current || current.resetAt < now) {
    const resetAt = now + WINDOW_MS
    RATE_LIMIT.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }
  current.count++
  const allowed = current.count <= max
  return { allowed, remaining: Math.max(0, max - current.count), resetAt: current.resetAt }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api/auth/')) {
    const ip = getClientIp(req)
    const { allowed, remaining, resetAt } = checkRateLimit(`auth:${ip}`, AUTH_MAX)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intentá de nuevo en 1 minuto.', retryAfter: Math.ceil((resetAt - Date.now()) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      )
    }
    const res = NextResponse.next()
    res.headers.set('X-RateLimit-Remaining', String(remaining))
    return res
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/:path*'],
}
