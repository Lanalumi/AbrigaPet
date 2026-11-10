import { deleteLocalizacao, updateLocalizacao } from '@/modules/gatis/server/service'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function PATCH(request: Request, { params }: { params: Promise<{ idGatil: string }> }) {
  const { idGatil } = await params

  try {
    const body = await request.json()
    const localizacao = await updateLocalizacao(idGatil, body)
    return NextResponse.json(localizacao)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[PATCH /api/gatis/:id]', error)
    return NextResponse.json({ message: 'Erro ao atualizar gatil' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ idGatil: string }> }) {
  const { idGatil } = await params

  try {
    const result = await deleteLocalizacao(idGatil)
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ id: result.id, action: result.action })
  } catch (error) {
    console.error('[DELETE /api/gatis/:id]', error)
    return NextResponse.json({ message: 'Erro ao excluir gatil' }, { status: 500 })
  }
}
