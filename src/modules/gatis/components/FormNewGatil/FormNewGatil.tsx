'use client'

import { Button } from '@/global/ui/Button/Button'
import { Field } from '@/global/ui/Field/Field'
import { ApiError } from '@/lib/client/errors'
import { createLocalizacaoSchema } from '@/schemas/localizacaoSchema'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useCreateGatil } from '../../hooks/useCreateGatil'

type GatilFormInput = z.infer<typeof createLocalizacaoSchema>

export function FormNewGatil() {
  const router = useRouter()
  const createGatil = useCreateGatil()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GatilFormInput>({
    defaultValues: { tipoLocal: '', nome: '' },
  })

  const onSubmit = (values: GatilFormInput) => {
    const result = createLocalizacaoSchema.safeParse(values)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof GatilFormInput, { message: issue.message })
        }
      }
      toast.error(result.error.issues[0]?.message ?? 'Verifique os campos do formulário')
      return
    }

    createGatil.mutate(result.data, {
      onSuccess: () => {
        toast.success('Gatil cadastrado com sucesso')
        router.push('/gatis')
        router.refresh()
      },
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : 'Erro ao cadastrar gatil')
      },
    })
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
  const isLoading = createGatil.isPending || isSubmitting

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)]">
      
      {/* Cabeçalho Centralizado com Ícone e Título */}
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] font-poppins tracking-tight">
            Dados do gatil
          </h1>
        </div>
        <p className="text-sm font-medium text-[#755835]/80 font-poppins">
          Preencha as informações para registrar um novo local de abrigo.
        </p>
      </header>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        
        {/* Mensagens de Alerta de Erro */}
        {validationMessages.length > 0 && (
          <div
            role="alert"
            className="rounded-2xl border border-[#B85454]/30 bg-[#FFF0ED] px-5 py-4 text-xs font-poppins text-[#8A3B3B]"
          >
            <p className="font-bold mb-2">Corrija os erros abaixo:</p>
            <ul className="list-disc pl-5 font-medium flex flex-col gap-0.5">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Grade de Formulário em 2 Colunas (com estilos aplicados) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#3A250B] [&_div]:flex [&_div]:flex-col [&_div]:gap-1.5 [&_input]:w-full [&_input]:h-[42px] [&_input]:rounded-lg [&_input]:border-[#755835]/20 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-medium [&_input]:text-[#755835] [&_input::placeholder]:font-normal [&_input::placeholder]:text-[#755835]/40">
          <Field label="Nome do Local" id="nome" type="text" placeholder="Ex: Lar Nenens" {...register('nome')} />
          <Field label="Tipo de local" id="tipoLocal" type="text" placeholder="Ex: LT" {...register('tipoLocal')} />
        </div>

        {/* Botões de Ação Alinhados à Direita */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-2 border-t border-[#755835]/15">
          <button
            type="button"
            onClick={() => router.push('/gatis')}
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
              Salvar Gatil
            </Button>
          )}
        </div>

      </form>
    </div>
  )
}