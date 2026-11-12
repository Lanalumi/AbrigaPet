'use client'

import { AvatarUpload } from '@/global/ui/AvatarUpload/AvatarUpload'
import { Button } from '@/global/ui/Button/Button'
import { CheckBox } from '@/global/ui/CheckBox/CheckBox'
import { DropDown } from '@/global/ui/DropDown/DropDown'
import { DateField } from '@/global/ui/DateField/DateField'
import { Field } from '@/global/ui/Field/Field'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { CreateAnimal, CreateAnimalForm } from '../../types'
import { toast } from 'react-toastify'
import { Especies, Cores, Sexos, Pelagens } from './components/especies'
import { createAnimalSchema } from '@/schemas/cadastroSchemas'
import { useCreateAnimal } from '../../hooks/useCreateAnimal'
import { ApiError } from '@/lib/client/errors'
import { parseBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'

type AnimalFormInput = Omit<
  CreateAnimalForm,
  'dataNascimento' | 'dataChegada' | 'dataSaida' | 'sexo' | 'motivoSaida'
> & {
  dataNascimento: string
  dataChegada: string
  sexo: 'femea' | 'macho'
  fiv?: boolean
  felv?: boolean
}

export const FormNewAnimal = () => {
  const router = useRouter()
  const createAnimalMutation = useCreateAnimal()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AnimalFormInput>({
    defaultValues: {
      dataChegada: '',
      especie: '',
      raca: '',
      cor: '',
      nome: '',
      dataNascimento: '',
      sexo: 'femea',
      pelagem: '',
      foto: '',
      fiv: false,
      felv: false,
    },
  })

  const onSubmit = (values: AnimalFormInput) => {
    const dataNascimento = values.dataNascimento.trim() ? parseBrDate(values.dataNascimento) : null
    if (values.dataNascimento.trim() && !dataNascimento) {
      setError('dataNascimento', { message: 'Data inválida. Use dd/mm/aaaa' })
      toast.error('Data de nascimento inválida. Use dd/mm/aaaa')
      return
    }

    const dataChegada = parseBrDate(values.dataChegada)
    if (!dataChegada) {
      setError('dataChegada', { message: 'Data inválida. Use dd/mm/aaaa' })
      toast.error('Data de chegada inválida. Use dd/mm/aaaa')
      return
    }

    const result = createAnimalSchema.safeParse({
      ...values,
      sexo: values.sexo === 'macho',
      dataNascimento,
      dataChegada,
      motivoSaida: null,
      dataSaida: null,
      foto: values.foto || null,
      fiv: Boolean(values.fiv),
      felv: Boolean(values.felv),
      fivFelv: Boolean(values.fiv || values.felv),
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof AnimalFormInput, { message: issue.message })
        }
      }

      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    createAnimalMutation.mutate(result.data as CreateAnimal, {
      onSuccess: (createdAnimal) => {
        toast.success('Animal cadastrado com sucesso')
        router.push(`/animais/${createdAnimal.id}`)
      },
      onError: (error) => {
        const message = error instanceof ApiError ? error.message : 'Erro ao cadastrar animal, tente novamente'
        toast.error(message)
      },
    })
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))

  const isLoading = createAnimalMutation.isPending || isSubmitting

  // Classe utilitária para padronizar e forçar os Dropdowns a colocarem a label em cima da caixa
  const dropdownFixClass = 'w-full'

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)]">
      {/* Cabeçalho */}
      <header className="flex items-center gap-3 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
          <img src="/images/icons/paw2.svg" alt="Ícone Patinha" width={22} height={22} className="object-contain" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#3A250B] font-poppins tracking-tight">Cadastro do Animal</h2>
          <p className="text-xs text-[#755835]/80 font-poppins">Preencha as informações do novo resgatado</p>
        </div>
      </header>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Mensagens de Erro */}
        {validationMessages.length > 0 && (
          <div
            role="alert"
            className="rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] p-4 text-sm text-[#8A3B3B] shadow-sm"
          >
            <div className="flex items-center gap-2 font-poppins font-semibold mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#B85454]" />
              Corrija os erros destacados abaixo:
            </div>
            <ul className="list-disc pl-6 space-y-1 font-poppins text-xs sm:text-sm">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Layout Principal em Duas Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Esquerdo: Formulário com Todos os Campos com Rótulo no Topo */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <Field label="Nome" id="nome" type="text" {...register('nome')} />

            <DateField label="Data de Chegada" id="dataChegada" {...register('dataChegada')} />

            <div className={dropdownFixClass}>
              <DropDown
                label="Espécie"
                options={[Especies[0].label, Especies[1].label]}
                value={[Especies[0].value, Especies[1].value]}
                id="especie"
                {...register('especie')}
              />
            </div>

            <Field label="Raça" id="raça" type="text" {...register('raca')} />

            <div className={dropdownFixClass}>
              <DropDown
                label="Cor"
                options={Cores.map((cor) => cor.label)}
                value={Cores.map((cor) => cor.value)}
                id="cor"
                {...register('cor')}
              />
            </div>

            <div className={dropdownFixClass}>
              <DropDown
                label="Pelagem"
                options={Pelagens.map((pelagem) => pelagem.label)}
                value={Pelagens.map((pelagem) => pelagem.value)}
                id="pelagem"
                {...register('pelagem')}
              />
            </div>

            <DateField label="Data de Nascimento" id="dataNascimento" {...register('dataNascimento')} />

            <div className="flex flex-col justify-end pt-1">
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
            </div>
          </div>

          {/* Lado Direito: Foto + Sorologia */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between gap-6 p-6 rounded-2xl bg-[#FDF8F3] border border-[#755835]/15 h-full">
            <div className="w-full flex flex-col items-center">
              <Controller
                name="foto"
                control={control}
                render={({ field }) => (
                  <AvatarUpload
                    id="foto"
                    label="Foto do Animal"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div className="w-full pt-4 border-t border-[#755835]/15 flex flex-col gap-3">
              <span className="text-sm font-semibold text-[#3A250B] font-poppins">Testes de Sorologia:</span>
              <div className="flex flex-col gap-2.5 font-poppins text-sm text-[#755835]">
                <label className="flex items-center gap-3 cursor-pointer select-none hover:opacity-80 transition-opacity">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#755835]/40 text-[#755835] focus:ring-[#755835] accent-[#755835] cursor-pointer"
                    {...register('fiv')}
                  />
                  <span className="font-medium text-[#3A250B]">Positivo para FIV</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none hover:opacity-80 transition-opacity">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#755835]/40 text-[#755835] focus:ring-[#755835] accent-[#755835] cursor-pointer"
                    {...register('felv')}
                  />
                  <span className="font-medium text-[#3A250B]">Positivo para FeLV</span>
                </label>
              </div>
              <p className="text-[11px] text-[#755835]/70 italic font-poppins mt-1">
                * Deixe desmarcado se for negativo para os dois.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex items-center justify-end pt-4 border-t border-[#755835]/15">
          {isLoading ? (
            <Button type="submit" disabled icon="/images/icons/save-button.svg">
              Salvando...
            </Button>
          ) : (
            <Button type="submit" green icon="/images/icons/save-button.svg">
              Salvar Animal
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
