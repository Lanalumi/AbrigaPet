export type PersonRole = 'voluntario' | 'adotante'

export function personRole(tipo: string): PersonRole | null {
  const normalized = tipo.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

  if (normalized.includes('volunt')) return 'voluntario'
  if (normalized.includes('adot')) return 'adotante'
  return null
}

export function personHref(id: string, role: PersonRole) {
  return role === 'voluntario' ? `/voluntarios/${id}` : `/adotantes/${id}`
}
