'use client'

import { Button, DropDown } from '@/global/ui'
import { clinicasListFiltersSchema } from '@/schemas/comunidade/clinicaSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ClinicasTable from '../components/ClinicasTable/ClinicasTable'
import { ClinicasListFilters, ListClinicasQuery, useClinicasList } from '@/modules/clinicas'

export default function ClinicaListView() {
  const route = useRouter()
  const [filters, setFilters] = useState<ClinicasListFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const query: ListClinicasQuery = {
    page: currentPage,
    pageSize,
    sortBy: filters.sortBy || 'nome',
    sortDir: filters.sortDir || 'asc',
    search: filters.search,
  }

  const { data: clinicasResponse, isLoading, error } = useClinicasList(query)

  const { register, handleSubmit } = useForm<ClinicasListFilters>({
    resolver: zodResolver(clinicasListFiltersSchema),
    defaultValues: {
      search: '',
      sortBy: 'nome',
      sortDir: 'asc',
    },
  })

  const items = clinicasResponse?.items || []
  const total = clinicasResponse?.total || 0
  const page = clinicasResponse?.page || 1
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const onFiltersSubmit = (data: ClinicasListFilters) => {
    setFilters(data)
    setCurrentPage(1)
  }

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const onSortChange = (sortBy: string, sortDir: 'asc' | 'desc') => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as 'nome' | 'cidade' | 'cnpj',
      sortDir,
    }))
    setCurrentPage(1)
  }

  const onPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto font-poppins py-12 flex flex-col items-center justify-center">
        <div className="p-6 rounded-3xl bg-[#FFF0ED] border border-[#B85454]/20 text-center flex flex-col items-center gap-2 max-w-md">
          <span className="text-base font-bold text-[#8A3B3B]">Erro ao carregar clínicas</span>
          <p className="text-xs text-[#8A3B3B]/80 font-medium">
            Não foi possível carregar as clínicas parceiras. Tente novamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-poppins pb-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#755835]/15">
        <div>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight">Clínicas</h1>
          <p className="text-xs text-[#755835]/80 mt-0.5">Gestão e cadastro de clínicas parceiras e veterinárias</p>
        </div>
        <Button type="button" onClick={() => route.push('/clinicas/new')} green icon="/images/icons/add-button.svg">
          Cadastrar Clínica
        </Button>
      </header>

      <div className="rounded-3xl border border-[#755835]/20 bg-white p-5 shadow-[0_10px_30px_rgba(58,37,11,0.05)] flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form
            onSubmit={handleSubmit(onFiltersSubmit)}
            className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1"
          >
            <div className="flex-1 min-w-[200px]">
              <input
                {...register('search')}
                placeholder="Pesquisar clínicas..."
                id="search-clinicas"
                type="text"
                className="w-full h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] placeholder:text-[#755835]/60 placeholder:font-medium focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all"
              />
            </div>

            <DropDown
              id="sortBy"
              options={['Nome', 'Cidade', 'CNPJ']}
              value={['nome', 'cidade', 'cnpj']}
              {...register('sortBy')}
            />

            <DropDown
              id="sortDir"
              options={['Ascendente', 'Descendente']}
              value={['asc', 'desc']}
              {...register('sortDir')}
            />
            <button
              type="submit"
              className="h-[42px] px-4 py-2 rounded-xl bg-[#755835] text-white hover:bg-[#3A250B] text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Aplicar filtros
            </button>
          </form>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#755835]/10 w-full md:w-auto justify-end">
            <label htmlFor="pageSize" className="text-xs font-semibold text-[#755835]">
              Exibir:
            </label>
            <DropDown
              id="pageSize"
              options={['10 por página', '20 por página', '50 por página', '100 por página']}
              value={['10', '20', '50', '100']}
              selected={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-[#755835] pt-3 border-t border-[#755835]/10 px-1">
          <span>
            Mostrando {items.length} de {total} Clínicas
          </span>
          <span>
            Página {page} de {totalPages}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs font-semibold text-[#755835]/70 italic flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#755835]/30 border-t-[#755835] rounded-full animate-spin" />
          Carregando clínicas...
        </div>
      ) : items.length > 0 ? (
        <ClinicasTable
          items={items}
          loading={isLoading}
          totalPages={totalPages}
          page={page}
          onPageChange={onPageChange}
          onSortChange={onSortChange}
          currentSort={{
            sortBy: filters.sortBy || 'nome',
            sortDir: filters.sortDir || 'asc',
          }}
        />
      ) : (
        <div className="rounded-3xl border border-[#755835]/20 bg-white p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[0_10px_30px_rgba(58,37,11,0.05)]">
          <h2 className="text-base font-bold text-[#3A250B]">Nenhuma clínica encontrada</h2>
          <p className="text-xs font-medium text-[#755835]/80">
            {Object.keys(filters).length > 0
              ? 'Tente ajustar os termos da sua pesquisa ou filtros.'
              : 'Utilize o botão no topo da página para cadastrar uma nova clínica.'}
          </p>
        </div>
      )}
    </div>
  )
}
