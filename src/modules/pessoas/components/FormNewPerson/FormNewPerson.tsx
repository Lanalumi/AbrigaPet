'use client'

import { DateField } from '@/global/ui/DateField/DateField'
import { Button, DropDown, Field } from '@/global/ui'
import { ApiError } from '@/lib/client/errors'
import { personHref, type PersonRole } from '@/modules/pessoas/personRole'
import { useCreatePessoa } from '@/modules/pessoas/hooks/useCreatePessoa'
import { createPersonSchema } from '@/schemas/personSchema'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

const personRoles = [
  { label: 'Voluntário', value: 'voluntario' },
  { label: 'Adotante', value: 'adotante' },
] as const

type PersonFormInput = {
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  dataInicio: string
  dataSaida: string
  tipo: string
}

const headings: Record<PersonRole | 'pessoa', string> = {
  pessoa: 'Dados da pessoa',
  voluntario: 'Dados do voluntário',
  adotante: 'Dados do adotante',
}

export const FormNewPerson = ({ role }: { role?: PersonRole }) => {
  const router = useRouter()
  const createPessoaMutation = useCreatePessoa()

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormInput>({
    defaultValues: {
      nome: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      dataInicio: '',
      dataSaida: '',
      tipo: role ?? '',
    },
  })

  const selectedRole = role ?? watch('tipo')
  const tipo = selectedRole === 'voluntario' || selectedRole === 'adotante' ? selectedRole : null

  const reportIssues = (issues: { path: PropertyKey[]; message: string }[]) => {
    for (const issue of issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        setError(field as keyof PersonFormInput, { message: issue.message })
      }
    }

    toast.error(issues[0]?.message ?? 'Verifique os campos do formulário')
  }

  const onSubmit = (values: PersonFormInput) => {
    if (values.tipo === 'voluntario' && !values.dataInicio.trim()) {
      setError('dataInicio', { message: 'Informe a data de inscrição' })
      toast.error('Informe a data de inscrição')
      return
    }

    if (values.tipo === 'adotante' && !values.dataInicio.trim()) {
      setError('dataInicio', { message: 'Informe a data de cadastro' })
      toast.error('Informe a data de cadastro')
      return
    }

    const result = createPersonSchema.safeParse({
      ...values,
      dataSaida: values.tipo === 'voluntario' && values.dataSaida.trim() ? values.dataSaida : null,
    })

    if (!result.success) {
      reportIssues(result.error.issues)
      return
    }

    const createdRole = result.data.tipo

    createPessoaMutation.mutate(result.data, {
      onSuccess: (createdPessoa: { idPessoa: string }) => {
        toast.success(
          createdRole === 'voluntario' ? 'Voluntário cadastrado com sucesso' : 'Adotante cadastrado com sucesso',
        )
        router.push(personHref(createdPessoa.idPessoa, createdRole))
      },
      onError: (error: unknown) => {
        const message = error instanceof ApiError ? error.message : 'Erro ao cadastrar pessoa, tente novamente'
        toast.error(message)
      },
    })
  }

  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))

  const isLoading = createPessoaMutation.isPending || isSubmitting

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-10 shadow-[0_10px_30px_rgba(58,37,11,0.05)] font-poppins">
      
      {/* Cabeçalho */}
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-8 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight">
            {headings[tipo ?? 'pessoa']}
          </h1>
        </div>
        <p className="text-xs text-[#755835]/80 font-medium">Preencha os dados cadastrais abaixo</p>
      </header>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        
        {/* Mensagens de Validação de Erro */}
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

        {/* Seleção do Tipo de Pessoa (Compacto) */}
        {!role && (
          <div className="w-full sm:w-1/2 [&_label]:font-bold [&_label]:text-[#3A250B] [&_select]:font-medium [&_select]:text-[#3A250B]">
            <DropDown
              label="Tipo de pessoa"
              options={['Selecione', ...personRoles.map((personRoleOption) => personRoleOption.label)]}
              value={['', ...personRoles.map((personRoleOption) => personRoleOption.value)]}
              id="tipo"
              {...register('tipo')}
            />
          </div>
        )}

        {/* Seção 1: Informações Pessoais */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#3A250B] border-b border-[#755835]/10 pb-2">Informações Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_label]:font-bold [&_label]:text-[#3A250B] [&_input]:font-medium [&_input]:text-[#3A250B]">
            <Field label="Nome completo" id="nome" type="text" {...register('nome')} />
            <Field label="CPF" id="cpf" type="text" {...register('cpf')} />
            <DateField label="Data de nascimento" id="dataNascimento" {...register('dataNascimento')} />
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

        {/* Seção 3: Campos Específicos para Voluntários */}
        {tipo === 'voluntario' && (
          <section className="flex flex-col gap-4 pt-2 border-t border-[#755835]/15">
            <h2 className="text-sm font-bold text-[#3A250B]">Dados do voluntariado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_label]:font-bold [&_label]:text-[#3A250B] [&_input]:font-medium [&_input]:text-[#3A250B]">
              <DateField label="Data de inscrição" id="dataInscricao" {...register('dataInicio')} />
              <DateField label="Data de saída" id="dataSaida" {...register('dataSaida')} />
            </div>
          </section>
        )}

        {/* Seção 4: Campos Específicos para Adotantes */}
        {tipo === 'adotante' && (
          <section className="flex flex-col gap-4 pt-2 border-t border-[#755835]/15">
            <h2 className="text-sm font-bold text-[#3A250B]">Dados do adotante</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_label]:font-bold [&_label]:text-[#3A250B] [&_input]:font-medium [&_input]:text-[#3A250B]">
              <DateField label="Data de cadastro" id="dataCadastro" {...register('dataInicio')} />
            </div>
          </section>
        )}

        {/* Botão de Salvar Limpo e Centralizado */}
        <div className="flex justify-center items-center pt-6 border-t border-[#755835]/15 mt-2">
          {isLoading ? (
            <Button type="submit" disabled icon="/images/icons/save-button.svg">
              Salvando...
            </Button>
          ) : (
            <Button type="submit" green icon="/images/icons/save-button.svg">
              Salvar
            </Button>
          )}
        </div>

      </form>
    </div>
  )
}