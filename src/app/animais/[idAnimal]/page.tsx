import FormEditAnimal from '@/modules/animais/componentes/FormEditAnimal/FormEditAnimal'
import { getAnimalById } from '@/modules/animais/server/service'
import { idSchema } from '@/schemas/cadastroSchemas'
import { notFound } from 'next/navigation'

export default async function AnimalPage({ params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params
  if (!idSchema.safeParse(idAnimal).success) notFound()

  const animal = await getAnimalById(idAnimal)
  if (!animal) notFound()

  return (
    <div className="flex w-full max-w-[94%] mx-auto flex-col p-4">
      <FormEditAnimal initialState={animal} id={idAnimal} />
    </div>
  )
}