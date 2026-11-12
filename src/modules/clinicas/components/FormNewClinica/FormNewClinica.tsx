'use client'

import { Button } from '@/global/ui/Button/Button'
import { Field } from '@/global/ui/Field/Field'
import { ApiError } from '@/lib/client/errors'
import { createClinicaSchema } from '@/schemas/clinicaSchema'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useCreateClinica } from '../../hooks/useCreateClinica'

type ClinicaFormInput = {
  nome: string
  cnpj: string
  telefone: string
  rua: string
  numero: string
  bairro: string
  cidade: string
}

export function FormNewClinica() {
  const router = useRouter()
  const createClinicaMutation = useCreateClinica()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClinicaFormInput>({
    defaultValues: {
      nome: '',
      cnpj: '',
      telefone: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
    },
  })

  const onSubmit = (values: ClinicaFormInput) => {
    const result = createClinicaSchema.safeParse(values)

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

    createClinicaMutation.mutate(result.data, {
      onSuccess: () => {
        toast.success('Clínica cadastrada com sucesso')
        router.push('/clinicas')
      },
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : 'Erro ao cadastrar clínica')
      },
    })
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
  const isLoading = createClinicaMutation.isPending || isSubmitting

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-10 shadow-[0_10px_30px_rgba(58,37,11,0.05)] font-poppins">
      
      {/* Cabeçalho Centralizado com Ícone e Título */}
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-8 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight">
            Dados da clínica
          </h1>
        </div>
        <p className="text-xs text-[#755835]/80 font-medium">Preencha os dados cadastrais da clínica parceira</p>
      </header>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        
        {/* Mensagens de Alerta de Erro */}
        {validationMessages.length > 0 && (
          <div
            role="alert"
            className="rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] p-4 text-xs text-[#8A3B3B]"
          >
            <p className="font-bold">Corrija os erros abaixo:</p>
            <ul className="mt-1.5 list-disc pl-5 font-medium flex flex-col gap-0.5">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Seção 1: Informações Principais */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#3A250B] border-b border-[#755835]/10 pb-2">Informações da Clínica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_label]:font-bold [&_label]:text-[#3A250B] [&_input]:font-medium [&_input]:text-[#3A250B]">
            <Field label="Nome" id="nome" type="text" {...register('nome')} />
            <Field label="CNPJ" id="cnpj" type="text" {...register('cnpj')} />
            <Field label="Telefone" id="telefone" type="tel" {...register('telefone')} />
          </div>
        </section>

        {/* Seção 2: Endereço */}
        <section className="flex flex-col gap-4 pt-2">
          <h2 className="text-sm font-bold text-[#3A250B] border-b border-[#755835]/10 pb-2">Endereço</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_label]:font-bold [&_label]:text-[#3A250B] [&_input]:font-medium [&_input]:text-[#3A250B]">
            <Field label="Rua" id="rua" type="text" {...register('rua')} />
            <Field label="Número" id="numero" type="text" {...register('numero')} />
            <Field label="Bairro" id="bairro" type="text" {...register('bairro')} />
            <Field label="Cidade" id="cidade" type="text" {...register('cidade')} />
          </div>
        </section>

        {/* Botões de Ação Centralizados */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-[#755835]/15 mt-2">
          {isLoading ? (
            <Button type="submit" disabled icon="/images/icons/save-button.svg">
              Salvando...
            </Button>
          ) : (
            <Button type="submit" green icon="/images/icons/save-button.svg">
              Salvar
            </Button>
          )}

          <Button type="button" onClick={() => router.push('/clinicas')}>
            Cancelar
          </Button>
        </div>

      </form>
    </div>
  )
}