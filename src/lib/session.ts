// LiderControl - Helper de sesión usando NextAuth
// Si no hay sesión → lanza error 401 (no hay fallback a usuario default)
// Esto protege todas las APIs: sin login, no se pueden ver datos

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado')
    this.name = 'UnauthorizedError'
  }
}

export async function getUsuarioActivo(_req?: NextRequest): Promise<any> {
  // Leer sesión de NextAuth
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      const u = await db.usuario.findUnique({ where: { id: session.user.id } })
      if (u) return u
    }
  } catch (e) {
    // NextAuth no está listo o no hay sesión
  }

  // Sin sesión → lanzar error
  throw new UnauthorizedError()
}

// Helper para manejar el error en las route handlers
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'No autorizado', needsAuth: true },
    { status: 401 }
  )
}

// No-op: con NextAuth el cambio de usuario se hace via signOut + signIn
export function setUsuarioActivoId(_id: string) {}
