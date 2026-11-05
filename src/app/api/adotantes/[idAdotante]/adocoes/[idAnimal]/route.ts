import { desvincularAdocao } from '@/modules/pessoas/server/adocoes'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ idAdotante: string; idAnimal: string }> },
) => {
  const { idAdotante, idAnimal } = await params

  try {
    const result = await desvincularAdocao(idAdotante, idAnimal)
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/adotantes/:id/adocoes/:idAnimal]', error)
    return NextResponse.json({ message: 'Erro ao remover adoção' }, { status: 500 })
  }
}
