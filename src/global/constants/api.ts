function normalizeApiBaseUrl(url: string): string {
  const base = url.replace(/\/$/, '')
  return base.endsWith('/api') ? base : `${base}/api`
}

function getServerApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL)
  }

  const vercelHost = process.env.VERCEL_URL
  if (vercelHost) {
    const host = vercelHost.startsWith('http') ? vercelHost : `https://${vercelHost}`
    return normalizeApiBaseUrl(host)
  }

  return 'http://localhost:3000/api'
}

export const API_URL = typeof window !== 'undefined' ? '/api' : getServerApiBaseUrl()

export async function getRequestApiUrl(): Promise<string> {
  if (typeof window !== 'undefined') {
    return '/api'
  }

  const { headers } = await import('next/headers')
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') ?? 'https'

  if (host) {
    return `${protocol}://${host}/api`
  }

  return getServerApiBaseUrl()
}
