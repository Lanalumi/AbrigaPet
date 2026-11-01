'use client'

import { Button } from '@/global/ui/Button/Button'
import { Field } from '@/global/ui/Field/Field'
import { ApiError } from '@/lib/client/errors'
import { updateLocalizacaoSchema } from '@/schemas/localizacaoSchema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useUpdateGatil } from '../../hooks/useUpdateGatil'
import { Localizacao } from '../../types'

type GatilEditFormInput = {
  nome: string
  tipoLocal: string
  ativo: 'true' | 'false'
}

function formValuesFrom(local: Pick<Localizacao, 'nome' | 'tipoLocal' | 'ativo'>): GatilEditFormInput {
  return {
    nome: local.nome,
    tipoLocal: local.tipoLocal,
    ativo: local.ativo ? 'true' : 'false',
  }
}

export function FormEditGatil({ initialState }: { initialState: Localizacao }) {
  const router = useRouter()
  const updateGatil = useUpdateGatil()
  const [saved, setSaved] = useState(initialState)
  const [editing, setEditing] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GatilEditFormInput>({
    defaultValues: formValuesFrom(initialState),
  })

  const leaveEditMode = () => {
    reset(formValuesFrom(saved))
    setEditing(false)
  }

  const onSubmit = (values: GatilEditFormInput) => {
    const result = updateLocalizacaoSchema.safeParse({
      nome: values.nome,
      tipoLocal: values.tipoLocal,
      ativo: values.ativo === 'true',
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && field in values) {
          setError(field as keyof GatilEditFormInput, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    updateGatil.mutate(
      { id: saved.id, data: result.data },
      {
        onSuccess: (updated) => {
          setSaved(updated)
          reset(formValuesFrom(updated))
          setEditing(false)
          toast.success('Gatil atualizado')
          router.refresh()
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'Erro ao atualizar gatil')
        },
      },
    )
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
  const isLoading = updateGatil.isPending || isSubmitting

  return (
    <div className="w-full flex flex-col rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)]">
      {/* Cabeçalho */}
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-xl font-bold text-[#3A250B] font-poppins tracking-tight">Dados do Gatil</h1>
        </div>
        <p className="text-xs text-[#755835]/80 font-poppins">
          Informações de cadastro do local onde os animais ficam abrigados.
        </p>
      </header>

      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {validationMessages.length > 0 && (
          <div
            role="alert"
            className="rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] px-5 py-4 text-xs font-poppins text-[#8A3B3B]"
          >
            <p className="font-bold mb-2">Corrija os erros abaixo:</p>
            <ul className="list-disc pl-5">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Campos em Grid de 3 Colunas */}
        <fieldset
          disabled={!editing}
          className={`m-0 p-0 border-0 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#3A250B] [&_div]:flex [&_div]:flex-col [&_div]:gap-1.5 [&_select]:w-full [&_select]:h-[42px] [&_select]:rounded-lg [&_select]:border-[#755835]/20 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-medium [&_select]:text-[#755835] [&_input]:w-full [&_input]:h-[42px] [&_input]:rounded-lg [&_input]:border-[#755835]/20 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-medium [&_input]:text-[#755835] ${
            editing ? '' : 'opacity-95'
          }`}
        >
          <Field label="Nome" id="nome" type="text" disabled={!editing} {...register('nome')} />
          <Field label="Tipo de local" id="tipoLocal" type="text" disabled={!editing} {...register('tipoLocal')} />
          
          <div className="flex flex-col">
            <label htmlFor="ativo">Status</label>
            <select
              id="ativo"
              disabled={!editing}
              {...register('ativo')}
              className="disabled:bg-[#FDF8F3]/50 disabled:cursor-not-allowed"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </fieldset>

        {/* Rodapé com Botões alinhados à direita */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-2 border-t border-[#755835]/15">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl bg-[#8AA36C] hover:bg-[#7a935c] transition-colors px-6 py-2.5 font-poppins text-xs font-bold text-white shadow-sm"
            >
              <img src="/images/icons/edit-button.svg" alt="" width={16} height={16} />
              Editar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={leaveEditMode}
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
                  Salvar
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  )
}