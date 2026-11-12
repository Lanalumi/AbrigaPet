import { redirect } from 'next/navigation'

export default async function NovaFichaRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string | string[] }>
}) {
  const { animalId } = await searchParams
  const id = Array.isArray(animalId) ? animalId[0] : animalId

  redirect(id ? `/saude/consultas/new?animalId=${encodeURIComponent(id)}` : '/saude/consultas/new')
}
