import { redirect } from 'next/navigation'

export default async function FichaMedicaPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string | string[] }>
}) {
  const { animalId } = await searchParams
  const id = Array.isArray(animalId) ? animalId[0] : animalId

  if (id) redirect(`/animais/${id}/fichamedica`)

  redirect('/saude')
}
