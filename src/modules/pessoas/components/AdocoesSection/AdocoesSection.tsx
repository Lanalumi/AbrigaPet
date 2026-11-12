'use client'

import { DateField } from '@/global/ui/DateField/DateField'
import { ApiError } from '@/lib/client/errors'
import { formatBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { useDesvincularAdocao, useVincularAdocao } from '@/modules/pessoas/hooks/useAdocoes'
import type { EditablePerson } from '@/modules/pessoas/server/loadPessoa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

export type AnimalDisponivel = { id: string; nome: string }

type AdocoesSectionProps = {
  idAdotante: string
  adocoes: EditablePerson['adocoes']
  disponiveis: AnimalDisponivel[]
  editing: boolean
}

export function AdocoesSection({ idAdotante, adocoes, disponiveis, editing }: AdocoesSectionProps) {
  const router = useRouter()
  const vincularMutation = useVincularAdocao()
  const desvincularMutation = useDesvincularAdocao()
  const [animalId, setAnimalId] = useState('')
  const [dataAdocao, setDataAdocao] = useState(() => formatBrDate(new Date()))

  const onVincular = () => {
    if (!animalId) {
      toast.error('Selecione um animal')
      return
    }

    vincularMutation.mutate(
      { idAdotante, animalId, dataAdocao: dataAdocao.trim() },
      {
        onSuccess: () => {
          setAnimalId('')
          toast.success('Adoção vinculada com sucesso')
          router.refresh()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Erro ao vincular adoção')
        },
      },
    )
  }

  const onDesvincular = (adocao: EditablePerson['adocoes'][number]) => {
    if (!confirm(`Remover a adoção de ${adocao.nome}?`)) return

    desvincularMutation.mutate(
      { idAdotante, animalId: adocao.animalId },
      {
        onSuccess: () => {
          toast.success('Adoção removida com sucesso')
          router.refresh()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Erro ao remover adoção')
        },
      },
    )
  }

  return (
    <section className="flex flex-col gap-3 pt-4 border-t border-[#755835]/15">
      <h2 className="text-sm font-bold text-[#3A250B]">Animais adotados</h2>
      {adocoes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {adocoes.map((adocao) => (
            <li key={adocao.animalId} className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#755835]">
              <span>
                {adocao.excluido ? (
                  <span className="text-[#755835]/70">{`${adocao.nome} (excluído)`}</span>
                ) : (
                  <Link href={`/animais/${adocao.animalId}`} className="text-[#8AA36C] hover:underline">
                    {adocao.nome}
                  </Link>
                )}
                <span>{` — ${adocao.dataAdocao}`}</span>
              </span>
              {editing && (
                <button
                  type="button"
                  onClick={() => onDesvincular(adocao)}
                  disabled={desvincularMutation.isPending}
                  className="cursor-pointer rounded-lg border border-[#B85454]/30 bg-[#FFF0ED] px-2.5 py-1 text-xs font-semibold text-[#8A3B3B] hover:bg-[#FFE2DB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-semibold text-[#755835]/70">Nenhum animal adotado</p>
      )}

      {editing && (
        <div className="grid grid-cols-1 items-end gap-4 rounded-2xl border border-[#755835]/20 bg-[#FFF9F7] p-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="flex flex-col">
            <label className="font-poppins text-base font-semibold text-[#755835]" htmlFor="adocaoAnimal">
              Animal
            </label>
            <select
              id="adocaoAnimal"
              value={animalId}
              onChange={(event) => setAnimalId(event.target.value)}
              className="w-full rounded-md border border-[#3A250B]/30 bg-white p-2 font-poppins text-base font-semibold text-[#755835] focus:outline-none"
            >
              <option value="">{disponiveis.length > 0 ? 'Selecione' : 'Nenhum animal disponível'}</option>
              {disponiveis.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="[&_input]:bg-white">
            <DateField
              label="Data da adoção"
              id="dataAdocao"
              value={dataAdocao}
              onChange={(event) => setDataAdocao(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                onVincular()
              }}
            />
          </div>
          <button
            type="button"
            onClick={onVincular}
            disabled={vincularMutation.isPending || disponiveis.length === 0}
            className="cursor-pointer rounded-xl py-2 bg-[#8AA36C] px-4 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {vincularMutation.isPending ? 'Vinculando...' : 'Vincular animal'}
          </button>
        </div>
      )}
    </section>
  )
}
