import { deleteClinicaById, updateClinicaById } from '@/modules/clinicas/server/service'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

function prismaCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }

  return null
}

export const PATCH = async (request: Request, { params }: { params: Promise<{ idClinica: string }> }) => {
  const { idClinica } = await params

  try {
    const body = await request.json()
    const clinica = await updateClinicaById(idClinica, body)
    return NextResponse.json(clinica)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    if (prismaCode(error) === 'P2025') {
      return NextResponse.json({ message: 'Clínica não encontrada' }, { status: 404 })
    }

    console.error('[PATCH /api/clinicas]', error)
    return NextResponse.json({ message: 'Erro ao atualizar clínica' }, { status: 500 })
  }
}

export const DELETE = async (_request: Request, { params }: { params: Promise<{ idClinica: string }> }) => {
  const { idClinica } = await params

  try {
    await deleteClinicaById(idClinica)
    return NextResponse.json({ id: idClinica }, { status: 200 })
  } catch (error) {
    if (prismaCode(error) === 'P2025') {
      return NextResponse.json({ message: 'Clínica não encontrada' }, { status: 404 })
    }

    if (prismaCode(error) === 'P2003') {
      return NextResponse.json(
        { message: 'Não é possível excluir porque há consultas vinculadas a esta clínica.' },
        { status: 409 },
      )
    }

    console.error('[DELETE /api/clinicas]', error)
    return NextResponse.json({ message: 'Erro ao excluir clínica' }, { status: 500 })
  }
}
