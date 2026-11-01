'use client'

import { useListQuery } from '@/global/hooks/useListQuery'
import { useMutation } from '@/global/hooks/useMutation'
import { API_URL } from '@/global/constants/api'
import { Card } from '@/global/ui/Card/Card'
import { DateField } from '@/global/ui/DateField/DateField'
import { Field } from '@/global/ui/Field/Field'
import { api } from '@/lib/http/api'
import { ApiError } from '@/lib/client/errors'
import { createPesoSchema, pesoRegistroSchema, pesoResumoSchema, type PesoRegistro, type PesoResumo } from '@/schemas/pesoSchema'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

type PesoModalProps = {
  animalId: string
  enabled?: boolean
}

function formatDate(value: Date) {
  const day = String(value.getUTCDate()).padStart(2, '0')
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const year = value.getUTCFullYear()

  return `${day}/${month}/${year}`
}

function formatPeso(value: number) {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`
}

function todayBr() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${day}/${month}/${now.getFullYear()}`
}

type PesoFormInput = {
  quantidadePeso: string
  dataPesagem: string
}

function PesoCard({ registro }: { registro: PesoRegistro }) {
  return (
    <Card
      title={formatPeso(registro.quantidadePeso)}
      infos={[
        { label: 'Data', value: formatDate(registro.dataPesagem) },
        { label: 'Status', value: registro.status },
      ]}
    />
  )
}

export function PesoModal({ animalId, enabled = true }: PesoModalProps) {
  const queryClient = useQueryClient()
  const peso = useListQuery<PesoResumo>({
    queryKey: ['peso', animalId],
    queryFn: async () => pesoResumoSchema.parse(await api<PesoResumo>(`${API_URL}/animais/${animalId}/peso`)),
    enabled,
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PesoFormInput>({
    defaultValues: {
      quantidadePeso: '',
      dataPesagem: todayBr(),
    },
  })
  const createPeso = useMutation<PesoRegistro, ApiError, PesoFormInput>({
    mutationFn: async (values) => {
      const created = await api(`${API_URL}/animais/${animalId}/peso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return pesoRegistroSchema.parse(created)
    },
    onSuccess: async () => {
      toast.success('Pesagem registrada')
      reset({ quantidadePeso: '', dataPesagem: todayBr() })
      await queryClient.invalidateQueries({ queryKey: ['peso', animalId] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erro ao registrar pesagem')
    },
  })

  const onSubmit = (values: PesoFormInput) => {
    const result = createPesoSchema.safeParse(values)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'quantidadePeso' || field === 'dataPesagem') {
          setError(field, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    createPeso.mutate({
      quantidadePeso: String(result.data.quantidadePeso),
      dataPesagem: result.data.dataPesagem.toISOString(),
    })
  }

  const atual = peso.data?.atual ?? null
  const historico = peso.data?.historico ?? []
  const validationMessages = [errors.quantidadePeso?.message, errors.dataPesagem?.message].filter(
    (message): message is string => Boolean(message),
  )

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => {
          event.stopPropagation()
          void handleSubmit(onSubmit)(event)
        }}
        className="flex flex-col gap-4 rounded-xl border border-[#755835]/15 bg-[#FDF8F3] p-5"
      >
        <p className="font-poppins text-[15px] font-bold text-[#3A250B]">Nova pesagem</p>
        
        {validationMessages.length > 0 ? (
          <div role="alert" className="rounded-xl border border-[#B85454]/30 bg-[#FFF0ED] px-4 py-3 text-xs font-poppins text-[#8A3B3B]">
            <ul className="list-disc pl-4">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#3A250B] [&_div]:flex [&_div]:flex-col [&_div]:gap-1.5 [&_input]:h-[42px] [&_input]:w-full [&_input]:rounded-lg [&_input]:border-[#e5e7eb] [&_input]:bg-white [&_input]:px-3">
          <Field
            label="Peso (kg)"
            id={`peso-${animalId}`}
            type="text"
            inputMode="decimal"
            placeholder="0,0"
            {...register('quantidadePeso')}
          />
          <DateField label="Data" id={`data-peso-${animalId}`} {...register('dataPesagem')} />
        </div>

        <button
          type="submit"
          disabled={createPeso.isPending}
          className="mt-1 w-full sm:w-fit self-end cursor-pointer rounded-xl bg-[#8AA36C] hover:bg-[#7a935c] transition-colors px-6 py-2.5 font-poppins text-xs font-semibold text-white shadow-sm disabled:cursor-default disabled:opacity-50"
        >
          {createPeso.isPending ? 'Salvando...' : 'Registrar'}
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {peso.isPending ? (
          <p className="font-poppins text-sm font-medium text-[#755835]/70 text-center py-4">Carregando peso...</p>
        ) : null}
        
        {peso.isError ? (
          <p className="font-poppins text-sm font-medium text-[#8A3B3B] text-center py-4">Não foi possível carregar o peso.</p>
        ) : null}
        
        {peso.data && !atual ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#755835]/20 rounded-xl bg-white">
            <p className="font-poppins text-sm font-medium text-[#755835]/60">Nenhuma pesagem registrada no histórico.</p>
          </div>
        ) : null}
        
        {atual ? (
          <>
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#755835]/20 bg-[#FFF9F7] p-5">
              <div className="flex flex-col">
                <p className="font-poppins text-xs font-semibold text-[#755835]/70 uppercase tracking-wider mb-1">Peso atual</p>
                <p className="font-poppins text-3xl font-bold text-[#3A250B]">{formatPeso(atual.quantidadePeso)}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-poppins text-xs font-medium text-[#755835]/70">Pesagem aferida em</p>
                <p className="font-poppins text-sm font-semibold text-[#755835]">{formatDate(atual.dataPesagem)}</p>
              </div>
            </section>

            <section className="flex min-h-0 flex-col mt-2">
              <h2 className="shrink-0 font-poppins text-[15px] font-bold text-[#3A250B] mb-4">Histórico</h2>
              <div className="max-h-64 min-h-0 overflow-y-auto overscroll-y-contain pr-2 custom-scrollbar">
                {historico.length === 0 ? (
                  <p className="font-poppins text-sm font-medium text-[#755835]/60 text-center">Nenhuma pesagem anterior.</p>
                ) : (
                  <ul className="flex w-full flex-col gap-3 pb-2">
                    {historico.map((registro) => (
                      <li key={registro.id}>
                        <PesoCard registro={registro} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}