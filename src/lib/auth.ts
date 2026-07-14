// LiderControl - Configuración NextAuth.js v4
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXTAUTH_SECRET no definido o demasiado corto (mínimo 16 chars). ' +
        'Setealo en tus variables de entorno: `openssl rand -base64 32`.'
      )
    }
    console.warn(
      '⚠️  NEXTAUTH_SECRET no definido. Usando secret de desarrollo INSEGURO. ' +
      'NO usar en producción.'
    )
    return 'lidercontrol-dev-secret-DO-NOT-USE-IN-PRODUCTION'
  }
  return secret
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'LiderControl',
      credentials: {
        identifier: { label: 'Username o Email', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) return null
          const identifier = credentials.identifier.trim().toLowerCase()
          const usuario = await db.usuario.findFirst({
            where: { OR: [{ username: identifier }, { email: identifier }] },
          })
          if (!usuario || !usuario.password) return null
          const passwordValida = await bcrypt.compare(credentials.password, usuario.password)
          if (!passwordValida) return null
          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.email,
            image: usuario.color,
          } as any
        } catch (e: any) {
          console.error('[NextAuth authorize] error:', e)
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.color = (user as any).image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).color = token.color
      }
      return session
    },
  },
  secret: getAuthSecret(),
}
