import { FormNewFicha } from '@/app/saude/fichas/new/FormNewFicha'
import { prisma } from '@/lib/db'

export default async function NovaConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string | string[] }>
}) {
  const { animalId } = await searchParams
  const selectedAnimalId = Array.isArray(animalId) ? animalId[0] : animalId

  const [animais, clinicas, motivos] = await Promise.all([
    prisma.animal.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
    prisma.clinica.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
    prisma.motivo.findMany({ select: { nome: true }, orderBy: { nome: 'asc' } }),
  ])

  return (
    <div className="flex w-full max-w-4xl mx-auto flex-col p-6 sm:p-8">
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] font-poppins tracking-tight">Nova consulta</h1>
        </div>
        <p className="text-xs text-[#755835]/80 font-poppins">
          Registro de atendimento clínico e histórico de saúde
        </p>
      </header>
      
      <FormNewFicha
        animais={animais}
        clinicas={clinicas}
        motivos={motivos.map((motivo) => motivo.nome)}
        animalId={selectedAnimalId}
      />
    </div>
  )
}