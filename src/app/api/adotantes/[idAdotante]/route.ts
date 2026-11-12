import { deletePessoaById } from '@/modules/pessoas/server/deletePessoa'
import { NextResponse } from 'next/server'

export const DELETE = async (_request: Request, { params }: { params: Promise<{ idAdotante: string }> }) => {
  const { idAdotante } = await params

  try {
    const result = await deletePessoaById(idAdotante, 'adotante')
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ id: result.id }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/adotantes]', error)
    return NextResponse.json({ message: 'Erro ao excluir adotante' }, { status: 500 })
  }
}
