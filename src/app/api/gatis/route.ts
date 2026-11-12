import { createLocalizacao, listLocalizacoes } from '@/modules/gatis/server/service'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const localizacao = await createLocalizacao(body)
    return NextResponse.json(localizacao, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/gatis]', error)
    return NextResponse.json({ message: 'Erro ao cadastrar gatil' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const data = await listLocalizacoes(queryParams)

  return NextResponse.json(data)
}
