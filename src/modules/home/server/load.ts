import { prisma } from '@/lib/db'
import { cache } from 'react'
import { nextDoseLabel } from '@/modules/animais/prescricao/schedule'
import { personRole } from '@/modules/pessoas/personRole'
import { deriveSituacao, normalizeMotivoSaida, situacaoAnimalLabel } from '@/schemas/animalSchema'
import type { HomeAdocao, HomeAnimais, HomeComunidade, HomeGatil, HomeGato, HomeMedicamento } from '../types'

const TIME_ZONE = 'America/Sao_Paulo'

const LABELS: Record<string, string> = {
  gato: 'Gato',
  cachorro: 'Cachorro',
  preto: 'Preto',
  branco: 'Branco',
  cinza: 'Cinza',
  caramelo: 'Caramelo',
  laranja: 'Laranja',
  longo: 'Longo',
  curto: 'Curto',
  medio: 'Médio',
}

type Section<T> = { ok: true; data: T } | { ok: false }

function labelOf(value: string) {
  const key = value.trim().toLowerCase()
  return LABELS[key] ?? value
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value)
}

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour') === 24 ? 0 : read('hour'),
    minute: read('minute'),
    second: read('second'),
  }
}

function zonedDateTime(year: number, month: number, day: number) {
  let utc = Date.UTC(year, month - 1, day, 0, 0, 0)

  for (let pass = 0; pass < 2; pass += 1) {
    const zoned = zonedParts(new Date(utc))
    const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second)
    utc -= asUtc - utc
  }

  return new Date(utc)
}

function currentMonthRange(now = new Date()) {
  const { year, month } = zonedParts(now)
  const start = zonedDateTime(year, month, 1)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const end = zonedDateTime(nextYear, nextMonth, 1)
  return { start, end }
}

function doseTime(label: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(label)
  if (!match) return null
  return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
}

function soonestDose(labels: string[]) {
  const ranked = [...labels].sort((left, right) => {
    const leftTime = doseTime(left)
    const rightTime = doseTime(right)
    if (leftTime == null && rightTime == null) return 0
    if (leftTime == null) return 1
    if (rightTime == null) return -1
    return leftTime - rightTime
  })

  return ranked[0] ?? '—'
}

const loadGatos = cache(async (): Promise<HomeGato[]> => {
  const animals = await prisma.animal.findMany({
    where: { excluidoEm: null, especie: { equals: 'gato', mode: 'insensitive' } },
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      foto: true,
      sexo: true,
      especie: true,
      cor: true,
      raca: true,
      pelagem: true,
      dataChegada: true,
      fivFelv: true,
      motivoSaida: true,
      _count: { select: { adocoes: true } },
      historicosLocalizacao: {
        where: { dataSaida: null },
        orderBy: { dataEntrada: 'desc' },
        select: {
          localizacaoId: true,
          localizacao: { select: { nome: true } },
        },
      },
      consultas: {
        select: {
          dataAtendimento: true,
          prescricoes: {
            select: {
              id: true,
              dosagem: true,
              frequencia: true,
              duracaoTratamento: true,
              medicamento: { select: { nome: true } },
            },
          },
        },
      },
    },
  })

  return animals.map((animal) => {
    const medicamentos: HomeMedicamento[] = []

    for (const consulta of animal.consultas) {
      for (const prescricao of consulta.prescricoes) {
        const proximaDose = nextDoseLabel(consulta.dataAtendimento, prescricao.frequencia, prescricao.duracaoTratamento)
        if (proximaDose === 'Tratamento encerrado') continue

        medicamentos.push({
          id: prescricao.id,
          nome: prescricao.medicamento.nome,
          dosagem: prescricao.dosagem,
          frequencia: prescricao.frequencia,
          duracaoTratamento: prescricao.duracaoTratamento,
          proximaDose,
        })
      }
    }

    medicamentos.sort((left, right) => {
      const leftTime = doseTime(left.proximaDose)
      const rightTime = doseTime(right.proximaDose)
      if (leftTime != null && rightTime != null && leftTime !== rightTime) return leftTime - rightTime
      if (leftTime != null && rightTime == null) return -1
      if (leftTime == null && rightTime != null) return 1
      return left.nome.localeCompare(right.nome, 'pt-BR')
    })

    const situacao = deriveSituacao(animal.motivoSaida, animal._count.adocoes > 0)
    const localizacaoAtual = animal.historicosLocalizacao[0]?.localizacao.nome.trim() || 'Não informada'
    const medicineLabel =
      medicamentos.length === 0
        ? ''
        : medicamentos.length === 1
          ? medicamentos[0].nome
          : `${medicamentos.length} medicamentos`

    return {
      id: animal.id,
      nome: animal.nome,
      foto: animal.foto,
      sexoLabel: animal.sexo ? 'Macho' : 'Fêmea',
      especieLabel: labelOf(animal.especie),
      corLabel: labelOf(animal.cor),
      raca: animal.raca,
      pelagemLabel: labelOf(animal.pelagem),
      dataChegada: formatDate(animal.dataChegada),
      localizacaoAtual,
      localizacaoIds: [...new Set(animal.historicosLocalizacao.map((historico) => historico.localizacaoId))],
      situacaoLabel: situacaoAnimalLabel[situacao],
      fivFelv: animal.fivFelv,
      medicamentos,
      medicineLabel,
      proximaDoseLabel: medicamentos.length > 0 ? soonestDose(medicamentos.map((item) => item.proximaDose)) : '',
    }
  })
})

async function section<T>(label: string, load: () => Promise<T>): Promise<Section<T>> {
  try {
    return { ok: true, data: await load() }
  } catch (error) {
    console.error(`[home] ${label}`, error)
    return { ok: false }
  }
}

export function loadAnimaisResumo() {
  return section('animais', async (): Promise<HomeAnimais> => {
    const animals = await prisma.animal.findMany({
      where: { excluidoEm: null },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        foto: true,
        sexo: true,
        especie: true,
        motivoSaida: true,
        _count: { select: { adocoes: true } },
      },
    })

    return {
      total: animals.length,
      items: animals.map((animal) => ({
        id: animal.id,
        nome: animal.nome,
        foto: animal.foto,
        sexoLabel: animal.sexo ? 'Macho' : 'Fêmea',
        especieLabel: labelOf(animal.especie),
        situacaoLabel: situacaoAnimalLabel[deriveSituacao(animal.motivoSaida, animal._count.adocoes > 0)],
      })),
    }
  })
}

export function loadComunidade() {
  return section('comunidade', async (): Promise<HomeComunidade> => {
    const [tipos, clinicas] = await Promise.all([
      prisma.tipoPessoa.findMany({
        select: { tipo: true, _count: { select: { pessoas: true } } },
      }),
      prisma.clinica.count(),
    ])

    let voluntarios = 0
    let adotantes = 0

    for (const tipo of tipos) {
      const role = personRole(tipo.tipo)
      if (role === 'voluntario') voluntarios += tipo._count.pessoas
      if (role === 'adotante') adotantes += tipo._count.pessoas
    }

    return { voluntarios, clinicas, adotantes }
  })
}

export function loadMedicacao() {
  return section('medicacao', async () => {
    const gatos = await loadGatos()
    return gatos.filter((gato) => gato.medicamentos.length > 0)
  })
}

export function loadGatis() {
  return section('gatis', async (): Promise<HomeGatil[]> => {
    const [locais, gatos] = await Promise.all([
      prisma.localizacao.findMany({
        orderBy: { nome: 'asc' },
        select: {
          id: true,
          nome: true,
          tipoLocal: true,
          historicos: {
            where: { dataSaida: null },
            select: { animalId: true },
          },
        },
      }),
      loadGatos(),
    ])

    return locais.map((local) => ({
      id: local.id,
      nome: local.nome,
      tipoLocal: local.tipoLocal,
      totalAnimais: new Set(local.historicos.map((historico) => historico.animalId)).size,
      gatos: gatos.filter((gato) => gato.localizacaoIds.includes(local.id)),
    }))
  })
}

export function loadAdocoesDoMes() {
  return section('adocoes', async (): Promise<HomeAdocao[]> => {
    const { start, end } = currentMonthRange()
    const animals = await prisma.animal.findMany({
      where: {
        motivoSaida: { not: null },
        dataSaida: { gte: start, lt: end },
      },
      orderBy: { dataSaida: 'desc' },
      select: {
        id: true,
        nome: true,
        foto: true,
        especie: true,
        motivoSaida: true,
        dataSaida: true,
        adocoes: {
          orderBy: { dataAdocao: 'desc' },
          take: 1,
          select: {
            pessoa: {
              select: {
                nome: true,
                telefone: true,
                cidade: true,
                rua: true,
                numero: true,
                bairro: true,
              },
            },
          },
        },
      },
    })

    return animals.flatMap((animal) => {
      if (normalizeMotivoSaida(animal.motivoSaida) !== 'adocao' || !animal.dataSaida) return []

      return [
        {
          id: animal.id,
          dataAdocao: formatDate(animal.dataSaida),
          animal: {
            nome: animal.nome,
            foto: animal.foto,
            especieLabel: labelOf(animal.especie),
            situacaoLabel: situacaoAnimalLabel[deriveSituacao(animal.motivoSaida, true)],
          },
          adotante: animal.adocoes[0]?.pessoa ?? null,
        },
      ]
    })
  })
}
