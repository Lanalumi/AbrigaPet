import { deletePessoaById } from '@/modules/pessoas/server/deletePessoa'
import { NextResponse } from 'next/server'

export const DELETE = async (_request: Request, { params }: { params: Promise<{ idVoluntario: string }> }) => {
  const { idVoluntario } = await params

  try {
    const result = await deletePessoaById(idVoluntario, 'voluntario')
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ id: result.id }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/voluntarios]', error)
    return NextResponse.json({ message: 'Erro ao excluir voluntário' }, { status: 500 })
  }
}
