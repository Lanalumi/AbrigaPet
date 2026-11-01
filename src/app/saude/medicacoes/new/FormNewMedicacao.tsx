'use client'

import { Button } from '@/global/ui/Button/Button'
import { Field } from '@/global/ui/Field/Field'
import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { api } from '@/lib/http/api'
import { ApiError } from '@/lib/client/errors'
import { createMedicacaoSchema } from '@/schemas/saudeSchema'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { SelectField } from '../../SelectField'

type Option = { id: string; nome: string }
type ConsultaOption = { id: string; animalId: string; label: string }

type MedicacaoFormInput = {
  animalId: string
  consultaId: string
  medicamento: string
  tipo: string
  dosagem: string
  quantidade: string
  frequencia: string
  duracaoTratamento: string
}

export function FormNewMedicacao({
  animais,
  consultas,
  medicamentos,
  animalId,
  consultaId,
}: {
  animais: Option[]
  consultas: ConsultaOption[]
  medicamentos: string[]
  animalId?: string
  consultaId?: string
}) {
  const router = useRouter()
  const initialAnimalId = animais.some((animal) => animal.id === animalId) ? animalId : ''
  const initialConsultaId =
    initialAnimalId && consultas.some((consulta) => consulta.id === consultaId && consulta.animalId === initialAnimalId)
      ? consultaId
      : ''
  const createMedicacao = useMutation<{ id: string; consultaId: string; animalId: string }, ApiError, MedicacaoFormInput>(
    {
      mutationFn: (values) =>
        api(`${API_URL}/medicacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }),
    },
  )

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MedicacaoFormInput>({
    defaultValues: {
      animalId: initialAnimalId ?? '',
      consultaId: initialConsultaId ?? '',
      medicamento: '',
      tipo: '',
      dosagem: '',
      quantidade: '',
      frequencia: '',
      duracaoTratamento: '',
    },
  })

  const selectedAnimalId = watch('animalId')
  const consultasDoAnimal = useMemo(
    () => consultas.filter((consulta) => consulta.animalId === selectedAnimalId),
    [consultas, selectedAnimalId],
  )

  const onSubmit = (values: MedicacaoFormInput) => {
    const result = createMedicacaoSchema.safeParse({
      ...values,
      tipo: values.tipo.trim() || null,
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof MedicacaoFormInput, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    createMedicacao.mutate(
      {
        ...values,
        quantidade: String(result.data.quantidade),
        tipo: result.data.tipo ?? '',
      },
      {
        onSuccess: (created) => {
          toast.success('Medicação cadastrada')
          router.push(`/animais/${created.animalId}/fichamedica?consulta=${created.consultaId}`)
          router.refresh()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Erro ao cadastrar medicação')
        },
      },
    )
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
  const isLoading = createMedicacao.isPending || isSubmitting

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)] mt-4">
      {/* Cabeçalho Centralizado */}
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] font-poppins tracking-tight">Dados da Medicação</h1>
        </div>
        <p className="text-sm text-[#755835]/80 font-poppins font-medium">
          Preencha os detalhes do medicamento para vinculá-lo ao histórico do animal.
        </p>
      </header>

      {animais.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#755835]/20 rounded-2xl bg-[#FDF8F3]/50">
          <p className="max-w-md text-center font-poppins text-sm font-medium text-[#755835]">
            Cadastre um animal antes de registrar uma medicação.
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          {validationMessages.length > 0 && (
            <div
              role="alert"
              className="rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] px-5 py-4 text-sm font-poppins text-[#8A3B3B]"
            >
              <p className="font-bold mb-2">Corrija os erros abaixo:</p>
              <ul className="list-disc pl-5">
                {validationMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Grid do Formulário - Hierarquia Visual Corrigida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#3A250B] [&_div]:flex [&_div]:flex-col [&_div]:gap-1.5 [&_select]:w-full [&_select]:h-[42px] [&_select]:rounded-lg [&_select]:border-[#755835]/20 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-medium [&_select]:text-[#755835] [&_input]:w-full [&_input]:h-[42px] [&_input]:rounded-lg [&_input]:border-[#755835]/20 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-medium [&_input]:text-[#755835] [&_input::placeholder]:font-normal [&_input::placeholder]:text-[#755835]/40">
            
            {/* Coluna Esquerda */}
            <div className="flex flex-col gap-5">
              <SelectField
                label="Animal"
                id="animalId"
                {...register('animalId', {
                  onChange: () => setValue('consultaId', ''),
                })}
              >
                <option value="">Selecione o animal</option>
                {animais.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nome}
                  </option>
                ))}
              </SelectField>

              <div className="flex flex-col gap-1">
                <SelectField label="Consulta vinculada" id="consultaId" {...register('consultaId')} disabled={!selectedAnimalId}>
                  <option value="">{selectedAnimalId ? 'Selecione a consulta' : 'Escolha o animal primeiro'}</option>
                  {consultasDoAnimal.map((consulta) => (
                    <option key={consulta.id} value={consulta.id}>
                      {consulta.label}
                    </option>
                  ))}
                </SelectField>
                {selectedAnimalId && consultasDoAnimal.length === 0 && (
                  <p className="font-poppins text-[11px] font-medium text-[#8A3B3B] mt-1">
                    * Este animal não tem consultas. A medicação precisa de uma consulta.
                  </p>
                )}
              </div>

              <div>
                <Field label="Medicamento" id="medicamento" type="text" list="medicamentos" placeholder="Ex: Meloxicam" {...register('medicamento')} />
                <datalist id="medicamentos">
                  {medicamentos.map((medicamento) => (
                    <option key={medicamento} value={medicamento} />
                  ))}
                </datalist>
              </div>

              <Field label="Tipo (Comprimido, Gotas, Pomada...)" id="tipo" type="text" placeholder="Ex: Comprimido" {...register('tipo')} />
            </div>

            {/* Coluna Direita */}
            <div className="flex flex-col gap-5">
              <Field label="Dosagem" id="dosagem" type="text" placeholder="Ex: 2mg" {...register('dosagem')} />
              <Field label="Quantidade por dose" id="quantidade" type="number" min={1} placeholder="Ex: 1" {...register('quantidade')} />
              <Field label="Frequência" id="frequencia" type="text" placeholder="Ex: A cada 12 horas" {...register('frequencia')} />
              <Field label="Duração do tratamento" id="duracaoTratamento" type="text" placeholder="Ex: 7 dias" {...register('duracaoTratamento')} />
            </div>
          </div>

          {/* Rodapé com Botões */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-2 border-t border-[#755835]/15">
            <button
              type="button"
              onClick={() => router.push('/saude')}
              className="cursor-pointer rounded-xl border border-[#755835]/30 bg-[#FDF8F3] hover:bg-[#755835]/10 px-6 py-2.5 font-poppins text-[13px] font-bold text-[#3A250B] transition-all"
            >
              Cancelar
            </button>

            {isLoading ? (
              <Button type="submit" disabled icon="/images/icons/save-button.svg">
                Salvando...
              </Button>
            ) : (
              <Button type="submit" green icon="/images/icons/save-button.svg">
                Salvar Medicação
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}