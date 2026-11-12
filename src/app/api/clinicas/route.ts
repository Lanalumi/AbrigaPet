import { createClinica, listClinicas } from '@/modules/clinicas/server/service'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clinica = await createClinica(body)
    return NextResponse.json(clinica, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/clinicas]', error)
    return NextResponse.json({ message: 'Erro ao cadastrar clínica' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const data = await listClinicas(queryParams)

  return NextResponse.json(data)
}
