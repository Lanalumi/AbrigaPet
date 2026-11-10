import { DefaultSession } from 'next-auth'

type LoginRole = 'admin' | 'voluntario'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      tipo: LoginRole
    } & DefaultSession['user']
  }

  interface User {
    tipo: LoginRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    tipo?: LoginRole
    nome?: string
  }
}
