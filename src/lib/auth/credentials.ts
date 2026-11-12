import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const LOGIN_ROLES = ['admin', 'voluntario'] as const
export type LoginRole = (typeof LOGIN_ROLES)[number]

export function normalizeEmail(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function isLoginRole(tipo: string): tipo is LoginRole {
  return tipo === 'admin' || tipo === 'voluntario'
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function passwordMatches(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export async function findLoginAccount(email: string) {
  if (!email) return null

  return prisma.pessoa.findFirst({
    where: {
      email,
      senhaHash: { not: null },
      tipo: { tipo: { in: [...LOGIN_ROLES] } },
    },
    include: { tipo: true },
  })
}

export function isUniqueViolation(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}
