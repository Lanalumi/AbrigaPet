import { getRequestApiUrl } from '@/global/constants/api'
import { api } from '@/lib/http/api'
import FormEditAnimal from '@/modules/animais/componentes/FormEditAnimal/FormEditAnimal'
import type { Animal } from '@/modules/animais/types'
import { notFound } from 'next/navigation'

async function loadAnimal(idAnimal: string): Promise<Animal> {
  const apiUrl = await getRequestApiUrl()

  try {
    return await api<Animal>(`${apiUrl}/animais/${idAnimal}`, { cache: 'no-store' })
  } catch {
    notFound()
  }
}

export default async function AnimalPage({ params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params
  const animal = await loadAnimal(idAnimal)

  return (
    <div className="flex w-full max-w-[94%] mx-auto flex-col p-4">
      <FormEditAnimal initialState={animal} id={idAnimal} />
    </div>
  )
}