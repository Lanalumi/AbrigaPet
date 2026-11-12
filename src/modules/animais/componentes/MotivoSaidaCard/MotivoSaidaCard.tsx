'use client'

import { DateField } from '@/global/ui/DateField/DateField'
import { motivoSaidaLabel, motivoSaidaValues } from '@/schemas/animalSchema'
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form'

type SaidaForm = FieldValues & {
  motivoSaida: string
  dataSaida: string
}

export function MotivoSaidaCard<T extends SaidaForm>({
  register,
  disabled = false,
}: {
  register: UseFormRegister<T>
  disabled?: boolean
}) {
  return (
    <fieldset disabled={disabled} className="m-0 w-full border-0 p-0 disabled:opacity-95">
      <section className="flex w-full flex-col gap-4 rounded-2xl border border-[#755835]/20 bg-[#FFF9F7] p-4 sm:p-5">
        <h2 className="font-poppins text-base font-semibold text-[#755835]">Motivo de saída</h2>
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 [&_input]:bg-white">
          <div className="flex max-w-60 flex-col">
            <label className="font-poppins text-base font-semibold text-[#755835]" htmlFor="motivoSaida">
              Motivo
            </label>
            <select
              id="motivoSaida"
              className="w-full rounded-md border border-[#3A250B]/30 bg-white p-2 font-poppins text-base font-semibold text-[#755835] focus:outline-none disabled:cursor-not-allowed"
              {...register('motivoSaida' as Path<T>)}
            >
              <option value="">Selecione</option>
              {motivoSaidaValues.map((value) => (
                <option key={value} value={value}>
                  {motivoSaidaLabel[value]}
                </option>
              ))}
            </select>
          </div>
          <DateField label="Data" id="dataSaida" {...register('dataSaida' as Path<T>)} />
        </div>
      </section>
    </fieldset>
  )
}
