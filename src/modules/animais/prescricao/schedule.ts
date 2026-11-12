const DAY_MS = 24 * 60 * 60 * 1000

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function dateOnlyUtc(value: Date) {
  return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())
}

function addDays(utc: number, days: number) {
  return utc + days * DAY_MS
}

function formatUtc(utc: number) {
  const date = new Date(utc)
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()

  return `${day}/${month}/${year}`
}

export function parseDurationDays(duracao: string) {
  const text = normalize(duracao)
  if (/continu/.test(text)) return null

  const weeks = text.match(/(\d+)\s*semanas?/)
  if (weeks) return Number(weeks[1]) * 7

  const days = text.match(/(\d+)\s*dias?/)
  if (days) return Number(days[1])

  return null
}

export function parseIntervalHours(frequencia: string) {
  const text = normalize(frequencia)
  const slash = text.match(/(\d+)\s*\/\s*\d+\s*h/)
  if (slash) return Number(slash[1])

  const everyHours = text.match(/(?:a\s+)?cada\s+(\d+)\s*h|(\d+)\s*em\s*\d+\s*h/)
  if (everyHours) return Number(everyHours[1] ?? everyHours[2])

  if (/semana/.test(text)) {
    const times = text.match(/(\d+)\s*(?:x|vezes)/)
    const perWeek = times ? Number(times[1]) : 1
    return perWeek > 0 ? (24 * 7) / perWeek : null
  }

  const perDay = text.match(/(\d+)\s*(?:x|vezes)\s*(?:ao|por)\s*dia/)
  if (perDay) {
    const times = Number(perDay[1])
    return times > 0 ? 24 / times : null
  }

  if (/\b(uma vez|1 vez|diario|diaria)\b/.test(text)) return 24

  const everyDays = text.match(/(?:a\s+)?cada\s+(\d+)\s*dias?/)
  if (everyDays) return Number(everyDays[1]) * 24

  const periods = [/\bmanha\b/, /\btarde\b/, /\bnoite\b/].filter((pattern) => pattern.test(text)).length
  if (periods > 0) return 24 / periods

  return null
}

export function periodOfDay(frequencia: string) {
  const text = normalize(frequencia)
  const periods = [
    /\bmanha\b/.test(text) ? 'Manhã' : null,
    /\btarde\b/.test(text) ? 'Tarde' : null,
    /\bnoite\b/.test(text) ? 'Noite' : null,
  ].filter((period): period is string => period !== null)

  if (periods.length > 0) return periods.join(' e ')
  if (/\b(diario|diaria)\b/.test(text)) return 'Diário'

  const trimmed = frequencia.trim()
  return trimmed || '—'
}

export function isVacina(frequencia: string) {
  return normalize(frequencia) === 'vacina'
}

export function understandsFrequency(frequencia: string) {
  if (isVacina(frequencia)) return true
  const hours = parseIntervalHours(frequencia)
  return hours != null && hours > 0
}

export function understandsDuration(duracao: string) {
  if (/continu/.test(normalize(duracao))) return true
  const days = parseDurationDays(duracao)
  return days != null && days > 0
}

export function vaccineDoseLabel(next: Date | null, now = new Date()) {
  if (!next) return '—'
  const nextUtc = dateOnlyUtc(next)
  if (dateOnlyUtc(now) > nextUtc) return 'Tratamento encerrado'
  return formatUtc(nextUtc)
}

export function nextDoseLabel(start: Date, frequencia: string, duracao: string, now = new Date()) {
  const startUtc = dateOnlyUtc(start)
  const todayUtc = dateOnlyUtc(now)
  const durationDays = parseDurationDays(duracao)
  const endUtc = durationDays == null ? null : addDays(startUtc, durationDays - 1)

  if (endUtc != null && todayUtc > endUtc) return 'Tratamento encerrado'
  if (todayUtc < startUtc) return formatUtc(startUtc)

  const intervalHours = parseIntervalHours(frequencia)
  if (intervalHours == null || intervalHours <= 0) return '—'

  if (intervalHours < 24) return formatUtc(todayUtc)

  const intervalDays = Math.max(1, Math.round(intervalHours / 24))
  const elapsed = Math.round((todayUtc - startUtc) / DAY_MS)
  const remainder = elapsed % intervalDays
  const nextUtc = remainder === 0 ? todayUtc : addDays(todayUtc, intervalDays - remainder)

  if (endUtc != null && nextUtc > endUtc) return 'Tratamento encerrado'
  return formatUtc(nextUtc)
}

export function prescriptionNextDose(
  start: Date,
  frequencia: string,
  duracao: string,
  dataProximaDose: Date | null,
  now = new Date(),
) {
  if (isVacina(frequencia)) return vaccineDoseLabel(dataProximaDose, now)
  return nextDoseLabel(start, frequencia, duracao, now)
}

export function formatStartDate(value: Date) {
  return formatUtc(dateOnlyUtc(value))
}
