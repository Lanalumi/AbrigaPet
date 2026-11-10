import { hashPassword, isUniqueViolation, normalizeEmail } from '@/lib/auth/credentials'
import { prisma } from '@/lib/db'
import { createPersonSchema } from '@/schemas/personSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

async function findOrCreateTipo(tipo: 'voluntario' | 'adotante') {
  const existing = await prisma.tipoPessoa.findFirst({
    where: { tipo: { equals: tipo, mode: 'insensitive' } },
  })

  if (existing) return existing

  return prisma.tipoPessoa.create({
    data: { tipo },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createPersonSchema.parse(body)
    const tipo = await findOrCreateTipo(data.tipo)
    const email = normalizeEmail(data.email)
    const senhaHash = data.tipo === 'voluntario' && data.senha ? await hashPassword(data.senha) : null

    const pessoa = await prisma.pessoa.create({
      data: {
        tipoId: tipo.id,
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
        senhaHash,
      },
    })

    return NextResponse.json(
      {
        idPessoa: pessoa.id,
        id: pessoa.id,
        nome: pessoa.nome,
        tipo: data.tipo,
        email: pessoa.email,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    if (isUniqueViolation(error)) {
      return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 400 })
    }

    console.error('[POST /api/pessoas]', error)
    return NextResponse.json({ message: 'Erro ao cadastrar pessoa' }, { status: 500 })
  }
}
