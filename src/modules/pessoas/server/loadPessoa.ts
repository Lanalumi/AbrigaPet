import { prisma } from '@/lib/db'
import { formatBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { notFound, redirect } from 'next/navigation'
import { personHref, personRole, type PersonRole } from '../personRole'

export async function loadPessoaById(id: string) {
  return prisma.pessoa.findUnique({
    where: { id },
    include: {
      tipo: true,
      adocoes: {
        orderBy: { dataAdocao: 'desc' },
        include: { animal: { select: { id: true, nome: true, excluidoEm: true } } },
      },
    },
  })
}

export type EditablePerson = {
  id: string
  role: PersonRole
  nome: string
  cpf: string
  telefone: string
  dataNascimento: string
  rua: string
  numero: number
  bairro: string
  cidade: string
  dataInicio: string
  dataSaida: string
  email: string
  adocoes: { animalId: string; nome: string; dataAdocao: string; excluido: boolean }[]
}

export function toEditablePerson(pessoa: NonNullable<Awaited<ReturnType<typeof loadPessoaById>>>): EditablePerson {
  const role = personRole(pessoa.tipo.tipo)
  if (!role) {
    throw new Error('Papel de pessoa inválido')
  }

  return {
    id: pessoa.id,
    role,
    nome: pessoa.nome,
    cpf: pessoa.cpf,
    telefone: pessoa.telefone,
    dataNascimento: formatBrDate(pessoa.dataNascimento),
    rua: pessoa.rua,
    numero: pessoa.numero,
    bairro: pessoa.bairro,
    cidade: pessoa.cidade,
    dataInicio: formatBrDate(pessoa.dataInicio),
    dataSaida: formatBrDate(pessoa.dataSaida),
    email: pessoa.email ?? '',
    adocoes: pessoa.adocoes.map((adocao) => ({
      animalId: adocao.animal.id,
      nome: adocao.animal.nome,
      dataAdocao: formatBrDate(adocao.dataAdocao),
      excluido: adocao.animal.excluidoEm !== null,
    })),
  }
}

export async function requirePersonRole(id: string, expected: PersonRole) {
  const pessoa = await loadPessoaById(id)
  if (!pessoa) notFound()

  const role = personRole(pessoa.tipo.tipo)
  if (role !== expected) {
    if (role) redirect(personHref(pessoa.id, role))
    notFound()
  }

  return pessoa
}
