import { personHref, personRole } from '@/modules/pessoas/personRole'
import { loadPessoaById } from '@/modules/pessoas/server/loadPessoa'
import { notFound, redirect } from 'next/navigation'

export default async function PessoaPage({ params }: { params: Promise<{ idPessoa: string }> }) {
  const { idPessoa } = await params
  const pessoa = await loadPessoaById(idPessoa)
  if (!pessoa) notFound()

  const role = personRole(pessoa.tipo.tipo)
  if (!role) notFound()

  redirect(personHref(pessoa.id, role))
}
