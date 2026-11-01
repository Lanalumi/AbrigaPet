'use client'

import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/global/ui/Button/Button'
import { DateField } from '@/global/ui/DateField/DateField'
import { Field } from '@/global/ui/Field/Field'
import { CheckBox } from '@/global/ui/CheckBox/CheckBox'
import { UpdateAnimal, Animal } from '../../types'
import { useUpdateAnimal } from '../../hooks/useUpdateAnimal'
import {
  deriveSituacao,
  normalizeMotivoSaida,
  readSaidaFields,
  situacaoAnimalLabel,
  updateAnimalSchema,
} from '@/schemas/animalSchema'
import { toast } from 'react-toastify'
import { AvatarUpload } from '@/global/ui/AvatarUpload/AvatarUpload'
import { useDeleteAnimal } from '../../hooks/useDeleteAnimal'
import { AnimalApearence } from '../AnimalApearence/AnimalApearence'
import { AnimalHealth } from '../Animalhealth/AnimalHealth'
import { MotivoSaidaCard } from '../MotivoSaidaCard/MotivoSaidaCard'
import { LocalModal } from './LocalModal'

export type AnimalEditFormInput = Omit<
  UpdateAnimal,
  'dataNascimento' | 'dataChegada' | 'dataSaida' | 'sexo' | 'motivoSaida'
> & {
  dataNascimento: string
  dataChegada: string
  dataSaida: string
  sexo: 'femea' | 'macho'
  motivoSaida: string
  fiv?: boolean
  felv?: boolean
}

function parseBrDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

function formatBrDate(value: Date | string | null): string {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

function sameDate(a: Date | null, b: Date | string | null): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.getTime() === new Date(b).getTime()
}

function sexoLabel(sexo: boolean): 'femea' | 'macho' {
  return sexo ? 'macho' : 'femea'
}

function formValuesFrom(animal: Animal): AnimalEditFormInput {
  return {
    nome: animal.nome,
    sexo: sexoLabel(animal.sexo),
    cor: animal.cor,
    raca: animal.raca,
    pelagem: animal.pelagem,
    dataNascimento: formatBrDate(animal.dataNascimento),
    dataChegada: formatBrDate(animal.dataChegada),
    fivFelv: animal.fivFelv,
    fiv: Boolean((animal as any).fiv ?? animal.fivFelv),
    felv: Boolean((animal as any).felv ?? false),
    especie: animal.especie,
    foto: animal.foto,
    motivoSaida: normalizeMotivoSaida(animal.motivoSaida) ?? '',
    dataSaida: formatBrDate(animal.dataSaida),
  }
}

export default function FormEditAnimal({
  initialState,
  id,
  onSuccess,
}: {
  initialState: Animal
  id: string
  onSuccess?: () => void
}) {
  const router = useRouter()
  const updateAnimalMutation = useUpdateAnimal()
  const [saved, setSaved] = useState(initialState)
  const [editing, setEditing] = useState(false)
  const [noChangesMessage, setNoChangesMessage] = useState<string | null>(null)
  const deleteAnimalMutation = useDeleteAnimal()

  const onDelete = async (idAnimal: string) => {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return

    deleteAnimalMutation.mutate(idAnimal, {
      onSuccess: () => {
        toast.success('Animal excluído com sucesso')
        router.push('/animais')
      },
      onError: () => {
        toast.error('Erro ao excluir animal')
      },
    })
  }

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<AnimalEditFormInput>({
    defaultValues: formValuesFrom(initialState),
  })

  const leaveEditMode = () => {
    reset(formValuesFrom(saved))
    setNoChangesMessage(null)
    setEditing(false)
  }

  const onSubmit = (values: AnimalEditFormInput) => {
    setNoChangesMessage(null)

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

    const saida = readSaidaFields(values.motivoSaida, values.dataSaida, parseBrDate)
    if (!saida.ok) {
      setError(saida.field, { message: saida.message })
      toast.error(saida.message)
      return
    }

    const result = updateAnimalSchema.safeParse({
      ...values,
      sexo: values.sexo === 'macho',
      dataNascimento,
      dataChegada,
      motivoSaida: saida.motivoSaida,
      dataSaida: saida.dataSaida,
      fivFelv: Boolean(values.fiv || values.felv || values.fivFelv),
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof AnimalEditFormInput, { message: issue.message })
        }
      }

      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    const data = result.data
    const updates: Partial<UpdateAnimal> = {}

    if (data.nome !== saved.nome) updates.nome = data.nome
    if (data.sexo !== saved.sexo) updates.sexo = data.sexo
    if (data.cor !== saved.cor) updates.cor = data.cor
    if (data.raca !== saved.raca) updates.raca = data.raca
    if (data.pelagem !== saved.pelagem) updates.pelagem = data.pelagem
    if (!sameDate(data.dataNascimento, saved.dataNascimento)) updates.dataNascimento = data.dataNascimento
    if (!sameDate(data.dataChegada, saved.dataChegada)) updates.dataChegada = data.dataChegada
    if (data.fivFelv !== saved.fivFelv) updates.fivFelv = data.fivFelv
    if (data.especie !== saved.especie) updates.especie = data.especie
    if ((data.foto ?? null) !== (saved.foto ?? null)) updates.foto = data.foto
    const saidaChanged =
      (data.motivoSaida ?? null) !== normalizeMotivoSaida(saved.motivoSaida) ||
      !sameDate(data.dataSaida, saved.dataSaida)
    if (saidaChanged) {
      updates.motivoSaida = data.motivoSaida
      updates.dataSaida = data.dataSaida
    }

    if (Object.keys(updates).length === 0) {
      setNoChangesMessage('Nenhum campo alterado')
      return
    }

    updateAnimalMutation.mutate(
      { idAnimal: id, updates },
      {
        onSuccess: (updatedAnimal: Animal) => {
          onSuccess?.()
          setSaved(updatedAnimal)
          reset(formValuesFrom(updatedAnimal))
          setEditing(false)
          toast.success('Animal atualizado com sucesso')
          router.refresh()
        },
        onError: () => {
          toast.error('Erro ao atualizar animal')
        },
      },
    )
  }

  const isLoading = updateAnimalMutation.isPending || isSubmitting

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)]">
      {/* Cabeçalho Centralizado: Nome e Tag "Disponível" */}
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] font-poppins tracking-tight">{saved.nome || 'Animal'}</h1>
          <span className="bg-[#FFF9F7] text-[#755835] border border-[#755835]/40 text-xs font-semibold font-poppins px-3 py-1 rounded-xl shadow-xs">
            {situacaoAnimalLabel[deriveSituacao(saved.motivoSaida, saved.adotado)]}
          </span>
        </div>
        <p className="text-xs text-[#755835]/80 font-poppins">
          {editing
            ? 'Modo de Edição ativado — altere os dados desejados abaixo'
            : 'Ficha de cadastro e histórico de saúde do resgatado'}
        </p>
      </header>

      {/* Alertas de Notificação */}
      {updateAnimalMutation.error && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] p-4 text-xs font-poppins text-[#8A3B3B]"
        >
          {updateAnimalMutation.error.message}
        </div>
      )}
      {noChangesMessage && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-[#755835]/30 bg-[#FDF8F3] p-4 text-xs font-poppins text-[#755835]"
        >
          {noChangesMessage}
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Layout Principal em 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Esquerdo: Formulário de Dados */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <fieldset disabled={!editing} className="m-0 border-0 p-0 flex flex-col gap-4 disabled:opacity-95">
              {/* Linha 1: Nome e Data de Chegada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome" {...register('nome')} id="nome" type="text" />
                <DateField label="Data de Chegada" id="dataChegada" {...register('dataChegada')} />
              </div>

              {/* Aparência (Espécie, Cor, Raça, Pelagem) forçado em Grid de 2 colunas */}
              <div className="[&_fieldset]:border-0 [&_fieldset]:p-0 [&_fieldset]:m-0 [&_legend]:hidden [&_fieldset]:grid [&_fieldset]:grid-cols-1 sm:[&_fieldset]:grid-cols-2 [&_fieldset]:gap-4 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#3A250B] [&_div]:flex [&_div]:flex-col [&_div]:gap-1.5 [&_select]:w-full [&_select]:h-[42px] [&_select]:rounded-lg [&_select]:border-[#e5e7eb] [&_select]:bg-white [&_select]:px-3 [&_input]:w-full [&_input]:h-[42px] [&_input]:rounded-lg [&_input]:border-[#e5e7eb] [&_input]:px-3">
                <AnimalApearence register={register} editing={editing} />
              </div>

              {/* Linha 2: Data de Nascimento + Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <DateField label="Data de Nascimento" id="dataNascimento" {...register('dataNascimento')} />

                <div className="flex flex-col justify-end pb-1">
                  <Controller
                    name="sexo"
                    control={control}
                    render={({ field }) => (
                      <CheckBox
                        id="sexo"
                        title="Sexo"
                        options={[
                          { label: 'Fêmea', value: 'femea' },
                          { label: 'Macho', value: 'macho' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>
              </div>
            </fieldset>

            {/* Local Atual */}
            <div className="pt-3 border-t border-[#755835]/10">
              <LocalModal animalId={id} />
            </div>
          </div>

          {/* Lado Direito: Card Lateral da Foto e Saúde */}
          <div className="lg:col-span-4 flex flex-col items-center justify-start gap-6 p-6 rounded-2xl bg-[#FDF8F3] border border-[#755835]/15 h-full">
            {/* Foto do Animal */}
            <div className="w-full flex flex-col items-center">
              <Controller
                name="foto"
                control={control}
                render={({ field }) => (
                  <AvatarUpload
                    id="foto"
                    label="Foto do Animal"
                    disabled={!editing}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            {/* Sorologia: Checkboxes FIV / FeLV */}
            <div className="w-full pt-4 border-t border-[#755835]/15 flex flex-col gap-3">
              <span className="text-sm font-semibold text-[#3A250B] font-poppins">Testes de Sorologia:</span>
              <div className="flex flex-col gap-2.5 font-poppins text-sm text-[#755835]">
                <label
                  className={`flex items-center gap-3 ${editing ? 'cursor-pointer' : 'cursor-not-allowed'} select-none hover:opacity-80 transition-opacity`}
                >
                  <input
                    type="checkbox"
                    disabled={!editing}
                    className="w-5 h-5 rounded border-[#755835]/40 text-[#755835] focus:ring-[#755835] accent-[#755835] cursor-pointer disabled:opacity-60"
                    {...register('fiv')}
                  />
                  <span className="font-medium text-[#3A250B]">Positivo para FIV</span>
                </label>

                <label
                  className={`flex items-center gap-3 ${editing ? 'cursor-pointer' : 'cursor-not-allowed'} select-none hover:opacity-80 transition-opacity`}
                >
                  <input
                    type="checkbox"
                    disabled={!editing}
                    className="w-5 h-5 rounded border-[#755835]/40 text-[#755835] focus:ring-[#755835] accent-[#755835] cursor-pointer disabled:opacity-60"
                    {...register('felv')}
                  />
                  <span className="font-medium text-[#3A250B]">Positivo para FeLV</span>
                </label>
              </div>
              <p className="text-[11px] text-[#755835]/70 italic font-poppins mt-1">
                * Deixe desmarcado se for negativo para os dois.
              </p>
            </div>

            {/* Bloco Saúde: Sem Borda, Sem "Saúde" Duplicado e com Links Organizados */}
            <div className="w-full pt-4 border-t border-[#755835]/15 flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#3A250B] font-poppins">Saúde</span>
              <div className="flex flex-col gap-1 font-poppins text-xs font-semibold text-[#5C7C3A] [&_fieldset]:border-0 [&_fieldset]:p-0 [&_fieldset]:m-0 [&_fieldset]:bg-transparent [&_fieldset]:shadow-none [&_div]:border-0 [&_div]:p-0 [&_div]:m-0 [&_div]:bg-transparent [&_div]:shadow-none [&_legend]:hidden [&_h2]:hidden [&_h3]:hidden [&_h4]:hidden [&_input]:hidden [&_label:has(input)]:hidden [&_div:has(>input)]:hidden [&_a]:text-[#5C7C3A] [&_a]:font-semibold [&_a]:text-xs [&_a]:block [&_a]:py-0.5 [&_a]:hover:underline [&_button]:text-[#5C7C3A] [&_button]:font-semibold [&_button]:text-xs [&_button]:block [&_button]:py-0.5 [&_button]:hover:underline">
                <AnimalHealth control={control} animalId={id} editing={editing} />
              </div>
            </div>
          </div>
        </div>

        <MotivoSaidaCard register={register} disabled={!editing} />

        {/* Rodapé com Botões de Ação */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#755835]/15 mt-2">
          <button
            id="voltar-button"
            type="button"
            onClick={() => router.push('/animais')}
            className="cursor-pointer rounded-xl border border-[#755835]/30 bg-[#FDF8F3] hover:bg-[#755835]/10 px-4 py-2.5 font-poppins text-xs font-semibold text-[#3A250B] transition-all"
          >
            ← Voltar para lista
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {!editing ? (
              <Button type="button" green icon="/images/icons/edit-button.svg" onClick={() => setEditing(true)}>
                Editar Animal
              </Button>
            ) : (
              <>
                {isLoading ? (
                  <Button type="submit" disabled icon="/images/icons/save-button.svg">
                    Salvando...
                  </Button>
                ) : (
                  <Button type="submit" green icon="/images/icons/save-button.svg">
                    Salvar Alterações
                  </Button>
                )}

                <Button id="delete-button" type="button" red onClick={() => onDelete(saved.id)}>
                  {deleteAnimalMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>

                <Button id="cancelar-button" type="button" onClick={leaveEditMode}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}