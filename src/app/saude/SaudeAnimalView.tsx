import { prisma } from '@/lib/db'
import { CommunityCardItem, CommunityColumn } from '../comunidade/CommunityColumn'
import { SaudeActions } from './SaudeActions'

function formatDate(value: Date) {
  const day = String(value.getDate()).padStart(2, '0')
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const year = value.getFullYear()

  return {
    label: `${day}/${month}/${year}`,
    sort: `${year}-${month}-${day}`,
  }
}

async function loadSaudeLists() {
  const [animais, consultas] = await Promise.all([
    prisma.animal.findMany({
      where: { excluidoEm: null },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        consultas: {
          orderBy: { dataAtendimento: 'desc' },
          take: 1,
          select: {
            dataAtendimento: true,
            observacao: true,
            clinica: { select: { nome: true } },
            motivo: { select: { nome: true } },
          },
        },
      },
    }),
    prisma.consulta.findMany({
      where: { animal: { excluidoEm: null } },
      orderBy: { dataAtendimento: 'desc' },
      select: {
        id: true,
        observacao: true,
        dataAtendimento: true,
        dataRetorno: true,
        animal: { select: { id: true, nome: true } },
        clinica: { select: { nome: true } },
        motivo: { select: { nome: true } },
        _count: { select: { prescricoes: true } },
      },
    }),
  ])

  const fichas: CommunityCardItem[] = animais.map((animal) => {
    const ultima = animal.consultas[0]
    const atendimento = ultima ? formatDate(ultima.dataAtendimento) : null
    const searchText = [animal.nome, ultima?.clinica.nome, ultima?.motivo.nome, ultima?.observacao, atendimento?.label]
      .filter(Boolean)
      .join(' ')

    return {
      id: animal.id,
      nome: animal.nome,
      href: `/animais/${animal.id}/fichamedica`,
      searchText,
      sortValues: {
        animal: animal.nome,
        dataAtendimento: atendimento?.sort ?? '',
        clinica: ultima?.clinica.nome ?? '',
      },
      infos: ultima
        ? [
            { label: 'Última consulta', value: atendimento?.label ?? '' },
            { label: 'Clínica', value: ultima.clinica.nome },
            { label: 'Motivo', value: ultima.motivo.nome },
            { label: 'Observação', value: ultima.observacao },
          ]
        : [{ label: 'Última consulta', value: 'Nenhuma' }],
    }
  })

  const historico: CommunityCardItem[] = consultas.map((consulta) => {
    const atendimento = formatDate(consulta.dataAtendimento)
    const retorno = consulta.dataRetorno ? formatDate(consulta.dataRetorno) : null
    const searchText = [
      consulta.animal.nome,
      consulta.clinica.nome,
      consulta.motivo.nome,
      consulta.observacao,
      atendimento.label,
      retorno?.label,
    ]
      .filter(Boolean)
      .join(' ')

    return {
      id: consulta.id,
      nome: `${consulta.animal.nome} — ${atendimento.label}`,
      href: `/animais/${consulta.animal.id}/fichamedica?consulta=${consulta.id}`,
      searchText,
      sortValues: {
        dataAtendimento: atendimento.sort,
        animal: consulta.animal.nome,
        clinica: consulta.clinica.nome,
        motivo: consulta.motivo.nome,
      },
      infos: [
        { label: 'Animal', value: consulta.animal.nome },
        { label: 'Clínica', value: consulta.clinica.nome },
        { label: 'Motivo', value: consulta.motivo.nome },
        { label: 'Prescrições', value: String(consulta._count.prescricoes) },
        { label: 'Retorno', value: retorno?.label ?? '' },
      ],
    }
  })

  return { fichas, historico }
}

export default async function SaudeAnimalView() {
  let fichas: CommunityCardItem[] = []
  let historico: CommunityCardItem[] = []
  let errorLabel: string | undefined

  try {
    const lists = await loadSaudeLists()
    fichas = lists.fichas
    historico = lists.historico
  } catch {
    errorLabel = 'Não foi possível carregar a lista'
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-poppins pb-8">
      
      {/* Cabeçalho da Página */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#755835]/15">
        <div>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight">Saúde animal</h1>
          <p className="text-xs text-[#755835]/80 mt-0.5">
            Acompanhamento de fichas médicas e histórico de consultas dos animais
          </p>
        </div>
        <SaudeActions />
      </header>

      {/* Grade de 2 Colunas para Fichas e Consultas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CommunityColumn
          heading="Fichas Médicas"
          searchId="search-fichas"
          searchPlaceholder="Pesquisar fichas médicas"
          sortOptions={[
            { value: 'animal', label: 'Animal' },
            { value: 'dataAtendimento', label: 'Última consulta' },
            { value: 'clinica', label: 'Clínica' },
          ]}
          defaultSortBy="animal"
          defaultSortDir="asc"
          items={fichas}
          emptyLabel="Nenhuma ficha médica encontrada"
          filteredEmptyLabel="Tente ajustar os filtros"
          errorLabel={errorLabel}
        />

        <CommunityColumn
          heading="Consultas"
          searchId="search-consultas"
          searchPlaceholder="Pesquisar consultas"
          sortOptions={[
            { value: 'dataAtendimento', label: 'Data de atendimento' },
            { value: 'animal', label: 'Animal' },
            { value: 'clinica', label: 'Clínica' },
            { value: 'motivo', label: 'Motivo' },
          ]}
          defaultSortBy="dataAtendimento"
          defaultSortDir="desc"
          items={historico}
          emptyLabel="Nenhuma consulta encontrada"
          filteredEmptyLabel="Tente ajustar os filtros"
          errorLabel={errorLabel}
        />
      </div>

    </div>
  )
}