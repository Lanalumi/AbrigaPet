'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type CommunityCardInfo = {
  label: string
  value: string
}

export type CommunityCardItem = {
  id: string
  nome: string
  searchText: string
  href?: string
  infos: CommunityCardInfo[]
  sortValues: Record<string, string>
}

type SortOption = {
  value: string
  label: string
}

type SortDir = 'asc' | 'desc'

type CommunityColumnProps = {
  heading: string
  searchId: string
  searchPlaceholder: string
  sortOptions: SortOption[]
  defaultSortBy: string
  defaultSortDir?: SortDir
  items: CommunityCardItem[]
  emptyLabel: string
  filteredEmptyLabel: string
  errorLabel?: string
}

export function CommunityColumn({
  heading,
  searchId,
  searchPlaceholder,
  sortOptions,
  defaultSortBy,
  defaultSortDir = 'asc',
  items,
  emptyLabel,
  filteredEmptyLabel,
  errorLabel,
}: CommunityColumnProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState(defaultSortBy)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir)

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = items

    if (term) {
      list = list.filter((item) => item.searchText.toLowerCase().includes(term))
    }

    return [...list].sort((a, b) => {
      const valA = (a.sortValues[sortBy] ?? '').toLowerCase()
      const valB = (b.sortValues[sortBy] ?? '').toLowerCase()

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [items, search, sortBy, sortDir])

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-[#755835]/20 bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(58,37,11,0.05)] w-full font-poppins">
      
      {/* Título do Card */}
      <div className="pb-2 border-b border-[#755835]/15">
        <h2 className="text-lg font-bold text-[#3A250B]">{heading}</h2>
      </div>

      {/* Formulário e Filtros Harmonizados */}
      <div className="flex flex-col gap-3">
        
        {/* Campo de Busca (Com a mesma fonte, altura e esteticismo dos selects) */}
        <div className="flex flex-col gap-1">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <input
            id={searchId}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] placeholder:text-[#755835]/60 placeholder:font-medium focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all"
          />
        </div>

        {/* Campo de Ordenação por Parâmetro */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Campo de Ordem (Ascendente/Descendente) */}
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as SortDir)}
          className="w-full h-[42px] rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3.5 py-2 text-xs font-semibold text-[#3A250B] focus:border-[#755835] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#755835] transition-all cursor-pointer"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>

        {/* Botão de Limpar/Aplicar Filtros */}
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="w-fit self-start px-3 py-1.5 rounded-xl border border-[#755835]/30 bg-[#FDF8F3] hover:bg-[#755835]/10 text-[11px] font-bold text-[#3A250B] transition-all cursor-pointer"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Contador de Resultados */}
      <div className="pt-2 border-t border-[#755835]/10 text-[11px] font-semibold text-[#755835]">
        Mostrando {filteredItems.length} de {items.length}
      </div>

      {/* Lista de Itens Cadastrados */}
      <div className="flex flex-col gap-3 min-h-[180px]">
        {errorLabel ? (
          <div className="p-4 rounded-2xl bg-[#FFF0ED] border border-[#B85454]/20 text-xs font-medium text-[#8A3B3B]">
            {errorLabel}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs font-semibold text-[#755835]/70 italic">
            {search ? filteredEmptyLabel : emptyLabel}
          </div>
        ) : (
          filteredItems.map((item) => {
            const CardWrapper = item.href ? Link : 'div'
            return (
              <CardWrapper
                key={item.id}
                href={item.href ?? '#'}
                className="group rounded-2xl border border-[#755835]/15 bg-[#FDF8F3] p-4 flex flex-col gap-2 hover:border-[#755835]/40 hover:bg-white transition-all shadow-xs"
              >
                <span className="text-sm font-bold text-[#3A250B] group-hover:text-[#5C7C3A] transition-colors">
                  {item.nome}
                </span>

                <dl className="grid grid-cols-1 gap-1 pt-1 border-t border-[#755835]/10">
                  {item.infos.map((info, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <dt className="font-semibold text-[#755835]/70">{info.label}:</dt>
                      <dd className="font-bold text-[#3A250B]">{info.value || '-'}</dd>
                    </div>
                  ))}
                </dl>
              </CardWrapper>
            )
          })
        )}
      </div>

    </section>
  )
}