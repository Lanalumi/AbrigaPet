import { isVacina } from '@/modules/animais/prescricao/schedule'
import { parseBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'

function toStoredDate(value: string) {
  const date = parseBrDate(value)
  if (!date) return null
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12))
}

export function prescricaoScheduleData(data: {
  frequencia: string
  duracaoTratamento: string
  dataAplicacao: string
  dataProximaDose: string
}) {
  const vacina = isVacina(data.frequencia)

  return {
    frequencia: data.frequencia.trim(),
    duracaoTratamento: vacina ? '—' : data.duracaoTratamento.trim(),
    dataAplicacao: vacina ? toStoredDate(data.dataAplicacao) : null,
    dataProximaDose: vacina ? toStoredDate(data.dataProximaDose) : null,
  }
}
