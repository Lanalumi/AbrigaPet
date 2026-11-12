import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function imageBytes(foto: string) {
  const marker = ';base64,'
  const markerAt = foto.indexOf(marker)
  if (!foto.startsWith('data:image/') || markerAt === -1) return null

  const type = foto.slice('data:'.length, markerAt)
  if (!type.startsWith('image/')) return null

  const bytes = Buffer.from(foto.slice(markerAt + marker.length).replace(/\s/g, ''), 'base64')
  if (bytes.length === 0) return null

  return { type, bytes }
}

export async function GET(_request: Request, { params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params

  const animal = await prisma.animal.findFirst({
    where: { id: idAnimal, excluidoEm: null },
    select: { foto: true },
  })

  const image = animal?.foto ? imageBytes(animal.foto.trim()) : null
  if (!image) {
    return new NextResponse(null, { status: 404 })
  }

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      'Content-Type': image.type,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
