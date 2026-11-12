import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'
import { findLoginAccount, isLoginRole, normalizeEmail, passwordMatches } from '@/lib/auth/credentials'
import { requireAuthSecret } from '@/lib/auth/secret'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        requireAuthSecret()
        const email = normalizeEmail(credentials?.email)
        const password = String(credentials?.password ?? '')
        if (!email || !password) return null

        const pessoa = await findLoginAccount(email)
        if (!pessoa?.senhaHash || !pessoa.email || !isLoginRole(pessoa.tipo.tipo)) return null

        const valid = await passwordMatches(password, pessoa.senhaHash)
        if (!valid) return null

        return {
          id: pessoa.id,
          name: pessoa.nome,
          email: pessoa.email,
          tipo: pessoa.tipo.tipo,
        }
      },
    }),
  ],
})
