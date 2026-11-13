'use client'

import { Button } from '@/global/ui/Button/Button'
import { DateField } from '@/global/ui/DateField/DateField'
import { Field } from '@/global/ui/Field/Field'
import { TextArea } from '@/global/ui/TextArea/TextArea'
import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { api } from '@/lib/http/api'
import { ApiError } from '@/lib/client/errors'
import { parseBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { createFichaMedicaSchema } from '@/schemas/saudeSchema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { SelectField } from '../../SelectField'

type Option = { id: string; nome: string }

type SavedConsulta = { id: string; animalId: string }

export type FichaFormInput = {
  animalId: string
  clinicaId: string
  motivo: string
  observacao: string
  dataAtendimento: string
  dataRetorno: string
}

export function FormNewFicha({
  animais,
  clinicas,
  motivos,
  animalId,
  existing,
}: {
  animais: Option[]
  clinicas: Option[]
  motivos: string[]
  animalId?: string
  existing?: { id: string; totalPrescricoes: number; values: FichaFormInput }
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(!existing)
  const initialAnimalId = animais.some((animal) => animal.id === animalId) ? animalId : ''
  const saveFicha = useMutation<SavedConsulta, ApiError, FichaFormInput>({
    mutationFn: (values) =>
      api(existing ? `${API_URL}/fichas/${existing.id}` : `${API_URL}/fichas`, {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }),
  })
  const deleteFicha = useMutation<SavedConsulta, ApiError, string>({
    mutationFn: (id) => api(`${API_URL}/fichas/${id}`, { method: 'DELETE' }),
  })

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FichaFormInput>({
    defaultValues: existing?.values ?? {
      animalId: initialAnimalId ?? '',
      clinicaId: '',
      motivo: '',
      observacao: '',
      dataAtendimento: '',
      dataRetorno: '',
    },
  })

  const leaveEditMode = () => {
    if (existing) reset(existing.values)
    setEditing(false)
  }

  const onDelete = () => {
    if (!existing || deleteFicha.isPending) return
    const total = existing.totalPrescricoes
    const extra = total === 0 ? '' : total === 1 ? ' e sua medicação' : ` e suas ${total} medicações`
    if (!confirm(`Tem certeza que deseja excluir esta consulta${extra}?`)) return

    deleteFicha.mutate(existing.id, {
      onSuccess: (deleted) => {
        toast.success('Consulta excluída com sucesso')
        router.push(`/animais/${deleted.animalId}/fichamedica`)
        router.refresh()
      },
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : 'Erro ao excluir consulta')
      },
    })
  }

  const onSubmit = (values: FichaFormInput) => {
    const dataAtendimento = parseBrDate(values.dataAtendimento)
    if (!dataAtendimento) {
      setError('dataAtendimento', { message: 'Data inválida. Use dd/mm/aaaa' })
      toast.error('Data de atendimento inválida. Use dd/mm/aaaa')
      return
    }

    const dataRetorno = values.dataRetorno.trim() ? parseBrDate(values.dataRetorno) : null
    if (values.dataRetorno.trim() && !dataRetorno) {
      setError('dataRetorno', { message: 'Data inválida. Use dd/mm/aaaa' })
      toast.error('Data de retorno inválida. Use dd/mm/aaaa')
      return
    }

    const result = createFichaMedicaSchema.safeParse({
      ...values,
      dataAtendimento,
      dataRetorno,
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof FichaFormInput, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    saveFicha.mutate(
      {
        ...values,
        dataAtendimento: result.data.dataAtendimento.toISOString(),
        dataRetorno: result.data.dataRetorno ? result.data.dataRetorno.toISOString() : '',
      },
      {
        onSuccess: (saved) => {
          toast.success(existing ? 'Consulta atualizada' : 'Consulta registrada')
          router.push(`/animais/${saved.animalId}/fichamedica?consulta=${saved.id}`)
          router.refresh()
        },
        onError: (error) => {
          const fallback = existing ? 'Erro ao atualizar consulta' : 'Erro ao registrar consulta'
          toast.error(error instanceof ApiError ? error.message : fallback)
        },
      },
    )
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
  const isLoading = saveFicha.isPending || isSubmitting

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[#3A250B]/30 bg-white p-4 shadow-[2px_4px_14px_rgba(58,37,11,0.1)]">
      <header className="flex w-full flex-row items-center justify-center gap-2">
        <img src="/images/icons/paw2.svg" alt="" width={24} height={24} />
        <span className="font-poppins font-semibold text-[#755835]">Dados da consulta</span>
      </header>
      {animais.length === 0 || clinicas.length === 0 ? (
        <p className="max-w-md text-center font-poppins text-sm font-semibold text-[#755835]">
          {animais.length === 0
            ? 'Cadastre um animal antes de registrar uma consulta.'
            : 'Cadastre uma clínica antes de registrar uma consulta.'}
        </p>
      ) : (
        <form className="flex max-w-full flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
          {validationMessages.length > 0 && (
            <div
              role="alert"
              className="rounded-md border border-[#B85454]/40 bg-[#FFF0ED] px-4 py-3 text-sm text-[#8A3B3B]"
            >
              <p className="font-poppins font-semibold">Corrija os erros abaixo:</p>
              <ul className="mt-2 list-disc pl-5 font-poppins">
                {validationMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          <fieldset disabled={!editing} className="m-0 flex flex-col gap-4 border-0 p-0">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-col gap-4">
                <SelectField label="Animal" id="animalId" {...register('animalId')}>
                  <option value="">Selecione</option>
                  {animais.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nome}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Clínica" id="clinicaId" {...register('clinicaId')}>
                  <option value="">Selecione</option>
                  {clinicas.map((clinica) => (
                    <option key={clinica.id} value={clinica.id}>
                      {clinica.nome}
                    </option>
                  ))}
                </SelectField>
                <Field label="Motivo" id="motivo" type="text" list="motivos" {...register('motivo')} />
                <datalist id="motivos">
                  {motivos.map((motivo) => (
                    <option key={motivo} value={motivo} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-4">
                <DateField label="Data de atendimento" id="dataAtendimento" {...register('dataAtendimento')} />
                <DateField label="Data de retorno" id="dataRetorno" {...register('dataRetorno')} />
              </div>
            </div>
            <div className="flex w-full justify-center">
              <TextArea
                label="Observação"
                id="observacao"
                placeholder="Descreva o atendimento..."
                {...register('observacao')}
              />
            </div>
          </fieldset>
          {existing ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {!editing ? (
                <>
                  <Button type="button" green icon="/images/icons/edit-button.svg" onClick={() => setEditing(true)}>
                    Editar Consulta
                  </Button>
                  <Button type="button" onClick={() => router.back()}>
                    Voltar
                  </Button>
                </>
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
                  <Button type="button" red onClick={onDelete}>
                    {deleteFicha.isPending ? 'Excluindo...' : 'Excluir'}
                  </Button>
                  <Button type="button" onClick={leaveEditMode}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isLoading ? (
                <Button type="submit" disabled icon="/images/icons/save-button.svg">
                  Salvando...
                </Button>
              ) : (
                <Button type="submit" green icon="/images/icons/save-button.svg">
                  Salvar
                </Button>
              )}
              <Button type="button" onClick={() => router.push('/saude')}>
                Cancelar
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
