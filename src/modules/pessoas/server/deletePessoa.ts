import { prisma } from '@/lib/db'
import { personRole, type PersonRole } from '../personRole'

function prismaCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }

  return null
}

export async function deletePessoaById(id: string, expected?: PersonRole) {
  const pessoa = await prisma.pessoa.findUnique({
    where: { id },
    include: { tipo: true },
  })

  if (!pessoa) {
    return { ok: false as const, status: 404, message: 'Pessoa não encontrada' }
  }

  const role = personRole(pessoa.tipo.tipo)
  if (expected && role !== expected) {
    return { ok: false as const, status: 404, message: 'Pessoa não encontrada' }
  }

  try {
    await prisma.pessoa.delete({ where: { id } })
    return { ok: true as const, id }
  } catch (error) {
    if (prismaCode(error) === 'P2003') {
      return {
        ok: false as const,
        status: 409,
        message: 'Não é possível excluir porque há adoções vinculadas a esta pessoa.',
      }
    }

    throw error
  }
}
