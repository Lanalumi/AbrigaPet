'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AnimalCards from '../componentes/AnimalCards/AnimalCards'
import { useAnimalsList } from '../hooks/useAnimalsList'
import { AnimalsListFilters, ListAnimalsQuery } from '../types'
import { animalsListFiltersSchema } from '@/schemas/animalSchema'
import { Field } from '@/global/ui/Field/Field'
import { Button } from '@/global/ui/Button/Button'
import { useRouter } from 'next/navigation'

export default function AnimalListView() {
  const route = useRouter()
  // State for filters, pagination, and sorting
  const [filters, setFilters] = useState<AnimalsListFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Build the complete query object with defaults
  const query: ListAnimalsQuery = {
    page: currentPage,
    pageSize,
    sortBy: filters.sortBy || 'dataChegada',
    sortDir: filters.sortDir || 'desc',
    search: filters.search,
  }

  const { data: animalsResponse, isLoading, error } = useAnimalsList(query)

  // Form for search and sorting
  const { register, handleSubmit } = useForm<AnimalsListFilters>({
    resolver: zodResolver(animalsListFiltersSchema),
    defaultValues: {
      search: '',
      sortBy: 'dataChegada',
      sortDir: 'desc',
    },
  })

  const items = animalsResponse?.items || []
  const total = animalsResponse?.total || 0
  const page = animalsResponse?.page || 1
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Form handlers
  const onFiltersSubmit = (data: AnimalsListFilters) => {
    setFilters(data)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const onPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF0ED] border border-[#B85454]/30 flex items-center justify-center text-[#B85454]">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#3A250B] font-poppins">Erro ao carregar animais</h1>
        <p className="text-xs text-[#755835]/80 font-poppins max-w-md">
          Não foi possível conectar ao servidor para obter os resgatados. Tente atualizar a página.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">
      
      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#755835]/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Ícone Patinha" width={24} height={24} className="object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#3A250B] font-poppins tracking-tight">Animais Resgatados</h1>
              <span className="bg-[#755835]/10 text-[#755835] text-xs font-bold font-poppins px-2.5 py-0.5 rounded-full">
                {total}
              </span>
            </div>
            <p className="text-xs text-[#755835]/80 font-poppins">Gerencie e visualize todos os cadastros do abrigo</p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => route.push('/animais/new')}
          green
          icon="/images/icons/add-button.svg"
        >
          Cadastrar Animal
        </Button>
      </div>

      {/* Barra de Busca e Filtros Totalmente Alinhada */}
      <div className="bg-white rounded-3xl border border-[#755835]/20 p-5 shadow-[0_10px_30px_rgba(58,37,11,0.05)] flex flex-col gap-4">
        <form onSubmit={handleSubmit(onFiltersSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          {/* Campo de Pesquisa com Fonte e Alinhamento Corrigidos */}
          <div className="md:col-span-5 flex flex-col gap-1 [&_input]:text-xs [&_input]:font-medium [&_input]:h-[42px] [&_input]:py-2 [&_input]:px-3 [&_input]:placeholder:text-xs [&_input]:placeholder:text-[#755835]/60 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#3A250B]">
            <Field
              label="Pesquisar"
              {...register('search')}
              placeholder="Pesquisar animais..."
              id="search-animais"
              type="text"
            />
          </div>

          {/* Ordenar Por */}
          <div className="md:col-span-3 flex flex-col gap-1">
            <label htmlFor="sortBy" className="text-xs font-semibold text-[#3A250B] font-poppins">
              Ordenar por
            </label>
            <select
              id="sortBy"
              {...register('sortBy')}
              className="w-full border border-[#755835]/30 rounded-xl px-3 py-2 text-[#3A250B] bg-[#FDF8F3] font-poppins text-xs font-medium focus:ring-2 focus:ring-[#755835]/30 outline-none transition-all h-[42px] cursor-pointer"
            >
              <option value="dataChegada">Data de chegada</option>
              <option value="nome">Nome</option>
              <option value="dataNascimento">Data de nascimento</option>
              <option value="sexo">Sexo</option>
            </select>
          </div>

          {/* Ordem */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label htmlFor="sortDir" className="text-xs font-semibold text-[#3A250B] font-poppins">
              Ordem
            </label>
            <select
              id="sortDir"
              {...register('sortDir')}
              className="w-full border border-[#755835]/30 rounded-xl px-3 py-2 text-[#3A250B] bg-[#FDF8F3] font-poppins text-xs font-medium focus:ring-2 focus:ring-[#755835]/30 outline-none transition-all h-[42px] cursor-pointer"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>

          {/* Botão de Aplicar Filtros */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full h-[42px] border border-[#755835]/30 rounded-xl px-4 text-[#3A250B] bg-[#FDF8F3] hover:bg-[#755835]/15 font-poppins font-semibold text-xs transition-all cursor-pointer flex items-center justify-center"
            >
              Aplicar filtros
            </button>
          </div>
        </form>

        {/* Rodapé da Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#755835]/10 text-xs font-poppins text-[#755835]">
          <div className="font-medium">
            Mostrando <span className="font-bold text-[#3A250B]">{items.length}</span> de <span className="font-bold text-[#3A250B]">{total}</span> Animais • Página <span className="font-bold text-[#3A250B]">{page}</span> de <span className="font-bold text-[#3A250B]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="font-medium text-[#755835]">
              Itens por página:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-[#755835]/30 rounded-lg px-2.5 py-1 text-[#3A250B] bg-[#FDF8F3] font-poppins text-xs font-semibold outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Cards ou Estado de Carregamento / Vazio */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-[#755835]/20 shadow-sm gap-3">
          <div className="w-8 h-8 border-3 border-[#755835]/20 border-t-[#755835] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#755835] font-poppins">Carregando animais...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-6">
          <AnimalCards items={items} />

          {/* Navegação de Páginas */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-[#755835]/20 p-4 shadow-sm">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-[#755835]/30 bg-[#FDF8F3] hover:bg-[#755835]/10 font-poppins text-xs font-semibold text-[#3A250B] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>

              <span className="font-poppins text-xs font-semibold text-[#755835]">
                Página <span className="text-[#3A250B] font-bold px-2 py-0.5 bg-[#755835]/10 rounded-md">{page}</span> de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-[#755835]/30 bg-[#FDF8F3] hover:bg-[#755835]/10 font-poppins text-xs font-semibold text-[#3A250B] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Card Vazio */
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-[#755835]/20 shadow-sm text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#755835]/10 flex items-center justify-center text-[#755835]">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={28} height={28} className="opacity-60 object-contain" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#3A250B] font-poppins">Nenhum animal encontrado</h3>
            <p className="text-xs text-[#755835]/80 font-poppins mt-1">
              {Object.keys(filters).length > 0
                ? 'Tente ajustar os filtros de busca para encontrar os resgatados'
                : 'Ainda não há nenhum animal cadastrado no sistema.'}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => route.push('/animais/new')}
            green
            icon="/images/icons/add-button.svg"
          >
            Cadastrar Primeiro Animal
          </Button>
        </div>
      )}
    </div>
  )
}