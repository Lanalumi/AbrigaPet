'use client'

import { useListQuery } from '@/global/hooks/useListQuery'
import { useMutation } from '@/global/hooks/useMutation'
import { API_URL } from '@/global/constants/api'
import { Card } from '@/global/ui/Card/Card'
import { DropDown } from '@/global/ui/DropDown/DropDown'
import { DateField } from '@/global/ui/DateField/DateField'
import { Modal } from '@/global/ui/Modal/modal'
import { api } from '@/lib/http/api'
import { ApiError } from '@/lib/client/errors'
import {
  createHistoricoLocalSchema,
  historicoLocalRegistroSchema,
  historicoLocalResumoSchema,
  type HistoricoLocalRegistro,
  type HistoricoLocalResumo,
} from '@/schemas/localizacaoSchema'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

type LocalModalProps = {
  animalId: string
}

type LocalFormInput = {
  localizacaoId: string
  dataEntrada: string
}

function formatDate(value: Date) {
  const day = String(value.getUTCDate()).padStart(2, '0')
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const year = value.getUTCFullYear()

  return `${day}/${month}/${year}`
}

function todayBr() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${day}/${month}/${now.getFullYear()}`
}

function localLabel(local: { nome: string; tipoLocal: string }) {
  if (!local.tipoLocal || local.tipoLocal === local.nome) return local.nome
  return `${local.nome} · ${local.tipoLocal}`
}

function LocalCard({ registro }: { registro: HistoricoLocalRegistro }) {
  return (
    <Card
      title={registro.nome}
      infos={[
        { label: 'Tipo', value: registro.tipoLocal },
        { label: 'Entrada', value: formatDate(registro.dataEntrada) },
        { label: 'Saída', value: registro.dataSaida ? formatDate(registro.dataSaida) : undefined },
        { label: 'Status', value: registro.status },
      ]}
    />
  )
}

export function LocalModal({ animalId }: LocalModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const resumo = useListQuery<HistoricoLocalResumo>({
    queryKey: ['local', animalId],
    queryFn: async () =>
      historicoLocalResumoSchema.parse(await api<HistoricoLocalResumo>(`${API_URL}/animais/${animalId}/local`)),
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LocalFormInput>({
    defaultValues: {
      localizacaoId: '',
      dataEntrada: todayBr(),
    },
  })
  const createLocal = useMutation<HistoricoLocalRegistro, ApiError, LocalFormInput>({
    mutationFn: async (values) => {
      const created = await api(`${API_URL}/animais/${animalId}/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return historicoLocalRegistroSchema.parse(created)
    },
    onSuccess: async () => {
      toast.success('Local registrado')
      reset({ localizacaoId: '', dataEntrada: todayBr() })
      await queryClient.invalidateQueries({ queryKey: ['local', animalId] })
      await queryClient.invalidateQueries({ queryKey: ['animais'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erro ao registrar local')
    },
  })

  const onSubmit = (values: LocalFormInput) => {
    const result = createHistoricoLocalSchema.safeParse(values)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'localizacaoId' || field === 'dataEntrada') {
          setError(field, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    createLocal.mutate({
      localizacaoId: result.data.localizacaoId,
      dataEntrada: result.data.dataEntrada.toISOString(),
    })
  }

  const atual = resumo.data?.atual ?? null
  const historico = resumo.data?.historico ?? []
  const locais = resumo.data?.locais ?? []
  const validationMessages = [errors.localizacaoId?.message, errors.dataEntrada?.message].filter(
    (message): message is string => Boolean(message),
  )
  const currentLabel = resumo.isPending ? 'Carregando...' : atual ? atual.nome : 'Não informado'

  return (
    <div className="flex max-w-60 flex-col">
      <span className="font-poppins text-base font-semibold text-[#755835]">Local atual</span>
      <div className="flex items-center gap-2">
        <p className="font-poppins text-base font-semibold text-[#755835]">{currentLabel}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Editar local"
          className="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-[#755835] hover:bg-[#8AA36C]/20 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#8AA36C]"
        >
          <svg width="18" height="18" viewBox="0 0 22 21" fill="none" aria-hidden="true">
            <path
              d="M16.1298 1.79382C16.3947 1.54215 16.7092 1.34251 17.0553 1.20631C17.4015 1.0701 17.7725 1 18.1471 1C18.5217 1 18.8927 1.0701 19.2389 1.20631C19.585 1.34251 19.8995 1.54215 20.1644 1.79382C20.4293 2.04549 20.6395 2.34426 20.7828 2.67309C20.9262 3.00191 21 3.35434 21 3.71026C21 4.06617 20.9262 4.4186 20.7828 4.74743C20.6395 5.07625 20.4293 5.37503 20.1644 5.6267L6.54759 18.5627L1 20L2.51298 14.7298L16.1298 1.79382Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <Modal
        title="Local"
        isOpen={open}
        onClose={() => setOpen(false)}
        body={
          <div className="flex flex-col gap-4">
            <form
              onSubmit={(event) => {
                event.stopPropagation()
                void handleSubmit(onSubmit)(event)
              }}
              className="flex flex-col gap-3"
            >
              <p className="font-poppins text-sm font-semibold text-[#755835]">Novo local</p>
              {validationMessages.length > 0 ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#B85454]/40 bg-[#FFF0ED] px-3 py-2 text-sm text-[#8A3B3B]"
                >
                  <ul className="list-disc pl-5 font-poppins">
                    {validationMessages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="flex flex-wrap items-end gap-3">
                {locais.length === 0 ? (
                  <p className="font-poppins text-sm font-semibold text-[#755835]/70">Nenhum local cadastrado.</p>
                ) : (
                  <div className="w-[200px]">
                    <DropDown
                      label="Local"
                      id={`local-${animalId}`}
                      options={['Selecione', ...locais.map(localLabel)]}
                      value={['', ...locais.map((local) => local.id)]}
                      {...register('localizacaoId')}
                    />
                  </div>
                )}
                <DateField label="Data" id={`data-local-${animalId}`} {...register('dataEntrada')} />
              </div>
              <button
                type="submit"
                disabled={createLocal.isPending || locais.length === 0}
                className="w-fit cursor-pointer rounded-[10px] bg-[#8AA36C] px-4 py-2 font-poppins text-sm font-semibold text-white disabled:cursor-default disabled:opacity-50"
              >
                {createLocal.isPending ? 'Salvando...' : 'Registrar'}
              </button>
            </form>
            {resumo.isPending ? (
              <p className="font-poppins text-sm font-semibold text-[#755835]/70">Carregando local...</p>
            ) : null}
            {resumo.isError ? (
              <p className="font-poppins text-sm font-semibold text-[#8A3B3B]">Não foi possível carregar o local.</p>
            ) : null}
            {resumo.data && !atual ? (
              <p className="font-poppins text-sm font-semibold text-[#755835]">Nenhum local registrado.</p>
            ) : null}
            {atual ? (
              <>
                <section className="rounded-xl border border-[#3A250B]/30 bg-[#FFF9F7] p-4">
                  <p className="font-poppins text-sm font-semibold text-[#755835]/70">Local atual</p>
                  <p className="font-poppins text-3xl font-bold text-[#755835]">{atual.nome}</p>
                  <p className="font-poppins text-sm font-semibold text-[#755835]/70">
                    {atual.tipoLocal} · desde {formatDate(atual.dataEntrada)}
                  </p>
                </section>
                <section className="flex min-h-0 flex-col">
                  <h2 className="shrink-0 font-poppins text-lg font-bold text-[#755835]">Histórico</h2>
                  <div className="mt-3 max-h-64 min-h-0 overflow-y-auto overscroll-y-contain pr-1">
                    {historico.length === 0 ? (
                      <p className="font-poppins text-sm font-semibold text-[#755835]/70">Nenhum local anterior.</p>
                    ) : (
                      <ul className="flex w-full flex-col gap-3 pb-2">
                        {historico.map((registro) => (
                          <li key={registro.id}>
                            <LocalCard registro={registro} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </>
            ) : null}
          </div>
        }
      />
    </div>
  )
}
