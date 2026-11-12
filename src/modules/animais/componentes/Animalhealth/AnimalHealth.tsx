'use client'

import { CheckBox } from '@/global/ui/CheckBox/CheckBox'
import { Modal } from '@/global/ui/Modal/modal'
import { Control, Controller } from 'react-hook-form'
import Link from 'next/link'
import { useState } from 'react'
import { Sexos } from '../FormNewAnimal/components/especies'
import type { AnimalEditFormInput } from '../FormEditAnimal/FormEditAnimal'
import { FichaMedicaModal } from './FichaMedicaModal'
import { PesoModal } from './PesoModal'

export function AnimalHealth({
  control,
  animalId,
  editing,
}: {
  control: Control<AnimalEditFormInput>
  animalId: string
  editing: boolean
}) {
  const [pesoOpen, setPesoOpen] = useState(false)
  const [fichaMedicaOpen, setFichaMedicaOpen] = useState(false)
  return (
    <section className="flex w-full flex-col gap-4 rounded border border-[#3A250B]/30 bg-[#FFF9F7] p-2 font-poppins text-[12px] font-semibold text-[#755835]/70 outline-none">
      <h2 className="font-poppins text-base font-semibold text-[#755835]">Saúde</h2>
      <fieldset disabled={!editing} className="m-0 flex flex-col gap-4 border-0 p-0">
        <Controller
          name="sexo"
          control={control}
          render={({ field }) => (
            <CheckBox
              id="sexo"
              title="Sexo"
              options={Sexos}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name="fivFelv"
          control={control}
          render={({ field }) => (
            <CheckBox
              id="fivFelv"
              title="FIV/FeLV"
              value={field.value ? 'sim' : 'nao'}
              onChange={(selected) => field.onChange(selected === 'sim')}
              onBlur={field.onBlur}
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' },
              ]}
            />
          )}
        />
      </fieldset>
      {/* <Link
        href={`/animais/${animalId}/fichamedica`}
        className="font-poppins text-sm font-semibold text-[#8AA36C] hover:underline"
      >
        Ficha médica
      </Link> */}
      <button
        type="button"
        onClick={() => setFichaMedicaOpen(true)}
        className="w-fit font-poppins text-sm font-semibold text-[#8AA36C] hover:underline"
      >
        Ficha Médica
      </button>
      <Modal
        title="Ficha médica"
        body={<FichaMedicaModal animalId={animalId} enabled={fichaMedicaOpen} />}
        isOpen={fichaMedicaOpen}
        onClose={() => setFichaMedicaOpen(false)}
      ></Modal>

      <button
        type="button"
        onClick={() => setPesoOpen(true)}
        className="w-fit font-poppins text-sm font-semibold text-[#8AA36C] hover:underline"
      >
        Histórico de peso
      </button>
      <Modal
        title="Histórico de peso"
        isOpen={pesoOpen}
        onClose={() => setPesoOpen(false)}
        body={<PesoModal animalId={animalId} enabled={pesoOpen} />}
      />
    </section>
  )
}
