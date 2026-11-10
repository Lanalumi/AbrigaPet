export const VACINA_FREQUENCIA = 'Vacina'

export const FREQUENCIAS = [
  'A cada 8 horas',
  'A cada 12 horas',
  'A cada 24 horas',
  '2x ao dia',
  '3x ao dia',
  'Diário',
  'A cada 2 dias',
  'A cada 3 dias',
  '1x por semana',
  '2x por semana',
  'Manhã e noite',
  VACINA_FREQUENCIA,
] as const

export const DURACOES = [
  '3 dias',
  '5 dias',
  '7 dias',
  '10 dias',
  '14 dias',
  '21 dias',
  '30 dias',
  '1 semana',
  '2 semanas',
  '4 semanas',
  'Contínuo',
] as const

export function withCurrentOption(options: readonly string[], current: string) {
  const value = current.trim()
  if (!value || options.includes(value)) return options
  return [value, ...options]
}
