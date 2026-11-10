export function requireAuthSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET não está definido. Defina a variável de ambiente para habilitar o login.')
  }
  return secret
}
