import { isVacina, understandsDuration, understandsFrequency } from '@/modules/animais/prescricao/schedule'
import { parseBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import z from 'zod'

function emptyToNull(val: unknown) {
  if (val === null || val === undefined || val === '') return null
  return val
}

export const createFichaMedicaSchema = z.object({
  animalId: z.uuid('Selecione o animal'),
  clinicaId: z.uuid('Selecione a clínica'),
  motivo: z.string().trim().min(1, 'Informe o motivo'),
  observacao: z.string().trim().min(1, 'Informe a observação'),
  dataAtendimento: z.coerce.date('Data de atendimento inválida. Use dd/mm/aaaa'),
  dataRetorno: z.preprocess(emptyToNull, z.coerce.date('Data de retorno inválida. Use dd/mm/aaaa').nullable()),
})

export const createMedicacaoSchema = z.object({
  animalId: z.uuid('Selecione o animal'),
  consultaId: z.uuid('Selecione a ficha médica'),
  medicamento: z.string().trim().min(1, 'Informe o medicamento'),
  tipo: z.preprocess(emptyToNull, z.string().trim().nullable()),
  dosagem: z.string().trim().min(1, 'Informe a dosagem'),
  quantidade: z.coerce
    .number('Informe a quantidade')
    .int('A quantidade deve ser um número inteiro')
    .positive('A quantidade deve ser maior que zero'),
  frequencia: z.string().trim().min(1, 'Informe a frequência'),
  duracaoTratamento: z.string().trim(),
  dataAplicacao: z.string().trim(),
  dataProximaDose: z.string().trim(),
}).superRefine((data, ctx) => {
  if (!understandsFrequency(data.frequencia)) {
    ctx.addIssue({ code: 'custom', message: 'Selecione uma frequência da lista', path: ['frequencia'] })
  }

  if (isVacina(data.frequencia)) {
    const aplicada = parseBrDate(data.dataAplicacao)
    const proxima = parseBrDate(data.dataProximaDose)

    if (!aplicada) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe a data em que a vacina foi aplicada',
        path: ['dataAplicacao'],
      })
    }

    if (!proxima) {
      ctx.addIssue({ code: 'custom', message: 'Informe a data da próxima dose', path: ['dataProximaDose'] })
    }

    if (aplicada && proxima && proxima.getTime() < aplicada.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'A próxima dose deve ser na data da aplicação ou depois',
        path: ['dataProximaDose'],
      })
    }

    return
  }

  if (!understandsDuration(data.duracaoTratamento)) {
    ctx.addIssue({ code: 'custom', message: 'Selecione a duração do tratamento', path: ['duracaoTratamento'] })
  }
})

export const latestPrescriptionItemSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  dataInicio: z.string(),
  proximaDose: z.string(),
  dosagem: z.string(),
  periodo: z.string(),
})

export const latestPrescriptionSchema = z.object({
  medicamentos: z.array(latestPrescriptionItemSchema),
})

export type LatestPrescription = z.infer<typeof latestPrescriptionSchema>
