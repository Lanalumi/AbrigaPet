'use client'

import { DropDown } from '@/global/ui/DropDown/DropDown'
import { Field } from '@/global/ui/Field/Field'
import { UseFormRegister } from 'react-hook-form'
import { Cores, Especies, Pelagens } from '../FormNewAnimal/components/especies'
import type { AnimalEditFormInput } from '../FormEditAnimal/FormEditAnimal'

export function AnimalApearence({
  register,
  editing,
}: {
  register: UseFormRegister<AnimalEditFormInput>
  editing: boolean
}) {
  return (
    <section className="flex flex-col gap-4 w-full rounded border border-[#3A250B]/30 bg-[#FFF9F7] p-2 font-poppins text-[12px] font-semibold text-[#755835]/70 outline-none">
      <h2 className="font-poppins text-base font-semibold text-[#755835]">Aparência</h2>
      <DropDown
        label="Espécie"
        options={[Especies[0].label, Especies[1].label]}
        value={[Especies[0].value, Especies[1].value]}
        id="especie"
        {...register('especie')}
      />
      <DropDown
        label="Cor"
        options={Cores.map((cor) => cor.label)}
        value={Cores.map((cor) => cor.value)}
        id="cor"
        {...register('cor')}
      />
      <Field label="Raça" id="raça" type="text" disabled={!editing} {...register('raca')} />
      <DropDown
        label="Pelagem"
        options={Pelagens.map((pelagem) => pelagem.label)}
        value={Pelagens.map((pelagem) => pelagem.value)}
        id="pelagem"
        {...register('pelagem')}
      />
    </section>
  )
}
