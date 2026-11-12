import { FormEditPerson } from '@/modules/pessoas/views/FormEditPerson'
import { requirePersonRole, toEditablePerson } from '@/modules/pessoas/server/loadPessoa'

export default async function VoluntarioPage({ params }: { params: Promise<{ idVoluntario: string }> }) {
  const { idVoluntario } = await params
  const pessoa = await requirePersonRole(idVoluntario, 'voluntario')

  return (
    <div className="flex max-w-[94%] flex-col p-4">
      <FormEditPerson initialState={toEditablePerson(pessoa)} />
    </div>
  )
}
