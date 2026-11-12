'use client'

import { Button } from '@/global/ui/Button/Button'
import { Field } from '@/global/ui/Field/Field'
import { ApiError } from '@/lib/client/errors'
import { useDeleteClinica } from '@/modules/clinicas/hooks/useDeleteClinica'
import { useUpdateClinica } from '@/modules/clinicas/hooks/useUpdateClinica'
import type { Clinica } from '@/modules/clinicas/types'
import { createClinicaSchema } from '@/schemas/clinicaSchema'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

type ClinicaFormInput = {
  nome: string
  cnpj: string
  telefone: string
  rua: string
  numero: string
  bairro: string
  cidade: string
}

function formValuesFrom(clinica: Clinica): ClinicaFormInput {
  return {
    nome: clinica.nome,
    cnpj: clinica.cnpj,
    telefone: clinica.telefone,
    rua: clinica.rua,
    numero: String(clinica.numero),
    bairro: clinica.bairro,
    cidade: clinica.cidade,
  }
}

export function FormEditClinica({ initialState }: { initialState: Clinica }) {
  const router = useRouter()
  const updateClinicaMutation = useUpdateClinica()
  const deleteClinicaMutation = useDeleteClinica()
  const [saved, setSaved] = useState(initialState)
  const [editing, setEditing] = useState(false)
  const [noChangesMessage, setNoChangesMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClinicaFormInput>({
    defaultValues: formValuesFrom(initialState),
  })

  const leaveEditMode = () => {
    reset(formValuesFrom(saved))
    setNoChangesMessage(null)
    setEditing(false)
  }

  const onDelete = () => {
    if (deleteClinicaMutation.isPending) return
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return

    deleteClinicaMutation.mutate(saved.id, {
      onSuccess: () => {
        toast.success('Clínica excluída com sucesso')
        router.push('/clinicas')
      },
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : 'Erro ao excluir clínica')
      },
    })
  }

  const onSubmit = (values: ClinicaFormInput) => {
    setNoChangesMessage(null)

    const payload = {
      nome: values.nome.trim(),
      cnpj: values.cnpj.trim(),
      telefone: values.telefone.trim(),
      rua: values.rua.trim(),
      numero: values.numero.trim(),
      bairro: values.bairro.trim(),
      cidade: values.cidade.trim(),
    }

    const current = formValuesFrom(saved)
    const changed = (Object.keys(payload) as (keyof typeof payload)[]).some(
      (key) => payload[key] !== current[key].trim(),
    )
    if (!changed) {
      setNoChangesMessage('Nenhum campo alterado')
      return
    }

    const result = createClinicaSchema.safeParse(payload)
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof ClinicaFormInput, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    updateClinicaMutation.mutate(
      { id: saved.id, updates: payload },
      {
        onSuccess: (updated) => {
          setSaved(updated)
          reset(formValuesFrom(updated))
          setEditing(false)
          toast.success('Clínica atualizada com sucesso')
          router.refresh()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Erro ao atualizar clínica')
        },
      },
    )
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
  const isLoading = updateClinicaMutation.isPending || isSubmitting

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)] font-poppins">
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <Image src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="h-auto w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight">{saved.nome}</h1>
        </div>
        <p className="text-xs text-[#755835]/80">
          {editing ? 'Modo de Edição ativado — altere os dados desejados abaixo' : 'Ficha de cadastro da clínica'}
        </p>
      </header>

      {updateClinicaMutation.error && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] p-4 text-xs text-[#8A3B3B]"
        >
          {updateClinicaMutation.error.message}
        </div>
      )}
      {noChangesMessage && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-[#755835]/30 bg-[#FDF8F3] p-4 text-xs text-[#755835]"
        >
          {noChangesMessage}
        </div>
      )}
      {validationMessages.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] p-4 text-xs text-[#8A3B3B]"
        >
          <p className="font-bold">Corrija os erros abaixo:</p>
          <ul className="mt-1.5 list-disc pl-5 font-medium flex flex-col gap-0.5">
            {validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={!editing} className="m-0 border-0 p-0 disabled:opacity-95">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome" id="clinica-nome" type="text" {...register('nome')} />
            <Field label="CNPJ" id="clinica-cnpj" type="text" {...register('cnpj')} />
            <Field label="Telefone" id="clinica-telefone" type="tel" {...register('telefone')} />
            <Field label="Rua" id="clinica-rua" type="text" {...register('rua')} />
            <Field label="Número" id="clinica-numero" type="text" {...register('numero')} />
            <Field label="Bairro" id="clinica-bairro" type="text" {...register('bairro')} />
            <div className="sm:col-span-2">
              <Field label="Cidade" id="clinica-cidade" type="text" {...register('cidade')} />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#755835]/15 mt-2">
          <button
            type="button"
            onClick={() => router.push('/clinicas')}
            className="cursor-pointer rounded-xl border border-[#755835]/30 bg-[#FDF8F3] hover:bg-[#755835]/10 px-4 py-2.5 text-xs font-semibold text-[#3A250B] transition-all"
          >
            ← Voltar para lista
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {!editing ? (
              <Button type="button" green icon="/images/icons/edit-button.svg" onClick={() => setEditing(true)}>
                Editar Clínica
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
                <Button type="button" red onClick={onDelete}>
                  {deleteClinicaMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
                <Button type="button" onClick={leaveEditMode}>
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
