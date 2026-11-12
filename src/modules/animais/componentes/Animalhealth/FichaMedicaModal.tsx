'use client'

import { useListQuery } from '@/global/hooks/useListQuery'

import { API_URL } from '@/global/constants/api'

import { api } from '@/lib/http/api'

import { latestPrescriptionSchema, type LatestPrescription } from '@/schemas/saudeSchema'

import Link from 'next/link'

type FichaMedicaModalProps = {
  animalId: string

  enabled?: boolean
}

const fields = [
  { key: 'dataInicio', label: 'Data de início' },

  { key: 'proximaDose', label: 'Próxima dose' },

  { key: 'dosagem', label: 'Dosagem' },

  { key: 'periodo', label: 'Período do dia' },
] as const

export function FichaMedicaModal({ animalId, enabled = true }: FichaMedicaModalProps) {
  const prescription = useListQuery<LatestPrescription>({
    queryKey: ['prescricao', animalId],

    queryFn: async () =>
      latestPrescriptionSchema.parse(await api<LatestPrescription>(`${API_URL}/animais/${animalId}/prescricao`)),

    enabled,
  })

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Estado de Carregamento */}

      {prescription.isPending ? (
        <div className="flex items-center gap-2 font-poppins text-xs font-medium text-[#755835]">
          <div className="w-3.5 h-3.5 border-2 border-[#755835]/30 border-t-[#755835] rounded-full animate-spin" />
          Carregando prescrição...
        </div>
      ) : null}

      {/* Estado de Erro */}

      {prescription.isError ? (
        <p className="font-poppins text-xs font-medium text-[#8A3B3B] bg-[#FFF0ED] p-3 rounded-2xl border border-[#B85454]/20">
          Não foi possível carregar a prescrição.
        </p>
      ) : null}

      {/* Estado Vazio */}

      {prescription.data && prescription.data.medicamentos.length === 0 ? (
        <p className="font-poppins text-xs font-medium text-[#755835]/80 italic">
          Nenhuma prescrição registrada no momento.
        </p>
      ) : null}

      {/* Cartões de Medicamentos */}

      {prescription.data?.medicamentos.map((medicamento) => (
        <article
          key={medicamento.id}
          className="rounded-2xl border border-[#755835]/20 bg-[#FDF8F3] p-4 flex flex-col gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#755835]/15">
            <span className="w-2 h-2 rounded-full bg-[#5C7C3A]" />

            <h2 className="font-poppins text-sm font-bold text-[#3A250B]">{medicamento.nome}</h2>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col">
                <dt className="font-poppins text-[10px] font-semibold text-[#755835]/70 uppercase tracking-wider">
                  {field.label}
                </dt>

                <dd className="font-poppins text-xs font-bold text-[#3A250B] break-words mt-0.5">
                  {medicamento[field.key]}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}

      {/* Link para Ficha Médica Completa */}

      <div className="pt-1">
        <Link
          href={`/animais/${animalId}/fichamedica`}
          className="inline-flex items-center gap-1.5 font-poppins text-xs font-bold text-[#5C7C3A] hover:text-[#3A250B] hover:underline transition-colors"
        >
          <span>Ficha médica completa</span>

          <span>→</span>
        </Link>
      </div>
    </div>
  )
}
