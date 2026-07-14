// Augmentación de tipos de NextAuth: agregar `id` y `color` al Session.user.
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      color?: string | null
    }
  }
  interface User {
    id: string
    color?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    color?: string | null
  }
}
