import { FormEditClinica } from '@/modules/clinicas/components/FormEditClinica/FormEditClinica'
import { getClinicaById } from '@/modules/clinicas/server/service'
import { notFound } from 'next/navigation'

export default async function ClinicaPage({ params }: { params: Promise<{ idClinica: string }> }) {
  const { idClinica } = await params
  const clinica = await getClinicaById(idClinica)
  if (!clinica) notFound()

  return (
    <div className="flex max-w-[94%] flex-col p-4">
      <FormEditClinica initialState={clinica} />
    </div>
  )
}
