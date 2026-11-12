'use client'

import { Button } from '@/global/ui/Button/Button'
import { localizacoesListFiltersSchema } from '@/schemas/localizacaoSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useGatisList } from '../hooks/useGatisList'
import { ListLocalizacoesQuery, LocalizacoesListFilters } from '../types'
import { GatisActions } from './GatisActions'

export default function GatisView() {
  const [filters, setFilters] = useState<LocalizacoesListFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const query: ListLocalizacoesQuery = {
    page: currentPage,
    pageSize,
    sortBy: filters.sortBy || 'nome',
    sortDir: filters.sortDir || 'asc',
    search: filters.search,
  }

  const { data, isLoading, error } = useGatisList(query)

  const { register, handleSubmit } = useForm<LocalizacoesListFilters>({
    resolver: zodResolver(localizacoesListFiltersSchema),
    defaultValues: {
      search: '',
      sortBy: 'nome',
      sortDir: 'asc',
    },
  })

  const items = data?.items || []
  const total = data?.total || 0
  const page = data?.page || 1
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const onFiltersSubmit = (values: LocalizacoesListFilters) => {
    setFilters(values)
    setCurrentPage(1)
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto font-poppins py-12 flex flex-col items-center justify-center">
        <div className="p-6 rounded-3xl bg-[#FFF0ED] border border-[#B85454]/20 text-center flex flex-col items-center gap-2 max-w-md">
          <span className="text-base font-bold text-[#8A3B3B]">Erro ao carregar gatis</span>
          <p className="text-xs text-[#8A3B3B]/80 font-medium">Ocorreu uma falha ao carregar os locais. Tente recarregar a página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-poppins pb-8">
      
      {/* Cabeçalho */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#755835]/15">
        <div>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight">Gatis</h1>
          <p className="text-xs text-[#755835]/80 mt-0.5">Locais e setores de alojamento cadastrados</p>
        </div>
        <GatisActions />
      </header>

      {/* Painel de Filtros e Busca Harmonizado */}
      <div className="rounded-3xl border border-[#755835]/20 bg-white p-5 shadow-[0_10px_30px_rgba(58,37,11,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSubmit(onFiltersSubmit)} className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="flex-1 min-w-[200px]">
            <input
              {...register('search')}
              placeholder="Pesquisar gatis..."
              id="search-gatis"
              type="text"
              className="w-full h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] placeholder:text-[#755835]/60 placeholder:font-medium focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all"
            />
          </div>

          <select
            {...register('sortBy')}
            className="h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all cursor-pointer"
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="tipoLocal">Ordenar por Tipo</option>
          </select>

          <select
            {...register('sortDir')}
            className="h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all cursor-pointer"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>

          <button
            type="submit"
            className="h-[42px] px-4 py-2 rounded-xl bg-[#755835] text-white hover:bg-[#3A250B] text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Aplicar filtros
          </button>
        </form>

        {/* Seleção de itens por página */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#755835]/10 w-full md:w-auto justify-end">
          <label htmlFor="pageSize" className="text-xs font-semibold text-[#755835]">
            Exibir:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setCurrentPage(1)
            }}
            className="h-[36px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-2.5 text-xs font-bold text-[#3A250B] focus:outline-none transition-all cursor-pointer"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
      </div>

      {/* Indicador de Quantidade e Páginas */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#755835] px-1">
        <span>Mostrando {items.length} de {total} Gatis</span>
        <span>Página {page} de {totalPages}</span>
      </div>

      {/* Listagem em Grade */}
      {isLoading ? (
        <div className="py-12 text-center text-xs font-semibold text-[#755835]/70 italic flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#755835]/30 border-t-[#755835] rounded-full animate-spin" />
          Carregando gatis...
        </div>
      ) : items.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((local) => (
              <li key={local.id}>
                <div className="h-full rounded-3xl border border-[#755835]/20 bg-white p-5 shadow-[0_10px_30px_rgba(58,37,11,0.05)] hover:border-[#755835]/40 transition-all flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#755835]/15">
                      <Link
                        href={`/gatis/${local.id}`}
                        className="text-base font-bold text-[#3A250B] hover:text-[#5C7C3A] transition-colors"
                      >
                        {local.nome}
                      </Link>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${local.ativo ? 'bg-[#5C7C3A]/10 text-[#5C7C3A]' : 'bg-[#8A3B3B]/10 text-[#8A3B3B]'}`}>
                        {local.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <dl className="grid grid-cols-1 gap-2 pt-3 text-xs">
                      <div className="flex justify-between">
                        <dt className="font-semibold text-[#755835]/70">Tipo de local:</dt>
                        <dd className="font-bold text-[#3A250B]">{local.tipoLocal || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-semibold text-[#755835]/70">Animais no local:</dt>
                        <dd className="font-bold text-[#3A250B]">{String(local.totalAnimais ?? 0)}</dd>
                      </div>
                    </dl>
                  </div>

                  <Link
                    href={`/gatis/${local.id}`}
                    className="w-full text-center py-2 rounded-xl bg-[#FDF8F3] hover:bg-[#755835]/10 border border-[#755835]/20 text-xs font-bold text-[#3A250B] transition-all"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginação */}
          {totalPages > 1 && (
            <nav className="mt-4 flex items-center justify-center gap-3" aria-label="Paginação">
              <button
                type="button"
                onClick={() => setCurrentPage(page - 1)}
                disabled={page <= 1}
                className="cursor-pointer rounded-xl border border-[#755835]/30 bg-white hover:bg-[#FDF8F3] px-4 py-2 text-xs font-bold text-[#3A250B] disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow-xs"
              >
                ← Anterior
              </button>
              <span className="text-xs font-bold text-[#755835] px-2">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(page + 1)}
                disabled={page >= totalPages}
                className="cursor-pointer rounded-xl border border-[#755835]/30 bg-white hover:bg-[#FDF8F3] px-4 py-2 text-xs font-bold text-[#3A250B] disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow-xs"
              >
                Próxima →
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-[#755835]/20 bg-white p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[0_10px_30px_rgba(58,37,11,0.05)]">
          <h2 className="text-base font-bold text-[#3A250B]">Nenhum gatil encontrado</h2>
          <p className="text-xs font-medium text-[#755835]/80">
            {filters.search ? 'Tente ajustar os termos da sua pesquisa ou filtros' : 'Cadastre um gatil para começar'}
          </p>
        </div>
      )}
    </div>
  )
}