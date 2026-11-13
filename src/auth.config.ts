import type { NextAuthConfig } from 'next-auth'
import { requireAuthSecret } from '@/lib/auth/secret'

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tipo = user.tipo
        token.nome = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        const payload = token as { id?: string; tipo?: 'admin' | 'voluntario'; nome?: string }
        session.user.id = payload.id ?? ''
        if (payload.tipo === 'admin' || payload.tipo === 'voluntario') session.user.tipo = payload.tipo
        if (payload.nome) session.user.name = payload.nome
      }
      return session
    },
    authorized({ auth, request }) {
      requireAuthSecret()
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user
      const isLoginPage = pathname === '/' || pathname === '/login'

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/home', request.nextUrl))
        return true
      }

      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
