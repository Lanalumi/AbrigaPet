'use client'

import { DropDown, DateField } from '@/global/ui'
import { motivoSaidaLabel, motivoSaidaValues } from '@/schemas/animais/animalSchema'
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
            <DropDown
              label="Motivo de saída"
              options={motivoSaidaValues.map((value) => motivoSaidaLabel[value])}
              value={motivoSaidaValues.map((value) => value)}
              id="motivoSaida"
              {...register('motivoSaida' as Path<T>)}
            />
          </div>
          <DateField label="Data" id="dataSaida" {...register('dataSaida' as Path<T>)} />
        </div>
      </section>
    </fieldset>
  )
}
