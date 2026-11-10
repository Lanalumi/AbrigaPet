import { hashPassword, isLoginRole, isUniqueViolation, normalizeEmail } from '@/lib/auth/credentials'
import { prisma } from '@/lib/db'
import { formatBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { deletePessoaById } from '@/modules/pessoas/server/deletePessoa'
import { updatePersonFieldsSchema } from '@/schemas/personSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

function toPersonFields(pessoa: {
  id: string
  nome: string
  cpf: string
  telefone: string
  dataNascimento: Date
  rua: string
  numero: number
  bairro: string
  cidade: string
  dataInicio: Date
  dataSaida: Date | null
  email: string | null
}) {
  return {
    id: pessoa.id,
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
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ idPessoa: string }> }) {
  const { idPessoa } = await params

  try {
    const body = await request.json()
    const data = updatePersonFieldsSchema.parse(body)
    const existing = await prisma.pessoa.findUnique({
      where: { id: idPessoa },
      include: { tipo: true },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Pessoa não encontrada' }, { status: 404 })
    }

    const email = normalizeEmail(data.email)
    const canSignIn = isLoginRole(existing.tipo.tipo)
    if (canSignIn && !email) {
      return NextResponse.json({ message: 'E-mail inválido' }, { status: 400 })
    }

    const senha = data.senha?.trim() ?? ''
    const senhaHash = canSignIn && senha ? await hashPassword(senha) : null

    const pessoa = await prisma.pessoa.update({
      where: { id: idPessoa },
      data: {
        nome: data.nome,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        telefone: data.telefone,
        rua: data.rua,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        dataInicio: data.dataInicio,
        dataSaida: data.dataSaida,
        email: email || null,
        ...(canSignIn ? (senhaHash ? { senhaHash } : {}) : { senhaHash: null }),
      },
    })

    return NextResponse.json(toPersonFields(pessoa))
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    if (isUniqueViolation(error)) {
      return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 400 })
    }

    console.error('[PATCH /api/pessoas]', error)
    return NextResponse.json({ message: 'Erro ao atualizar pessoa' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ idPessoa: string }> }) {
  const { idPessoa } = await params

  try {
    const result = await deletePessoaById(idPessoa)
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('[DELETE /api/pessoas]', error)
    return NextResponse.json({ message: 'Erro ao excluir pessoa' }, { status: 500 })
  }
}
