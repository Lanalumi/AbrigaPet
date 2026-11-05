import { vincularAdocao } from '@/modules/pessoas/server/adocoes'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

export const POST = async (request: Request, { params }: { params: Promise<{ idAdotante: string }> }) => {
  const { idAdotante } = await params

  try {
    const body = await request.json()
    const result = await vincularAdocao(idAdotante, body)
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    console.error('[POST /api/adotantes/:id/adocoes]', error)
    return NextResponse.json({ message: 'Erro ao vincular adoção' }, { status: 500 })
  }
}
