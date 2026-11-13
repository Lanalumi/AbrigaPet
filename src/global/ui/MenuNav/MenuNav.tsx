'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export const MenuNav = () => {
  const pathname = usePathname()
  const router = useRouter()

  const isPathActive = (path: string, exact = false) => {
    if (exact) return pathname === path
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const getNavItemClass = (active: boolean) =>
    `flex items-center justify-between w-full px-4 py-3 rounded-2xl font-poppins text-sm font-bold transition-all ${
      active
        ? 'bg-[#FFF9F7] text-[#3A250B] shadow-xs'
        : 'text-[#3A250B]/80 hover:bg-[#FFF9F7]/60 hover:text-[#3A250B]'
    }`

  return (
    <aside className="fixed top-0 left-0 z-30 w-full md:w-56 lg:w-60 h-auto md:h-screen bg-[#D0DAC4] border-r border-[#755835]/15 flex flex-col justify-between p-4 sm:p-5 shadow-sm">
      
      {/* Topo: Logo & Marca AbrigaPet + Menu */}
      <div className="flex flex-col gap-6">
        
        {/* Logo e Nome da Plataforma */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FFF9F7] shrink-0 border border-[#755835]/15 shadow-xs">
            <img src="/images/logo.svg" alt="Logo AbrigaPet" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-poppins font-extrabold text-lg text-[#3A250B] tracking-tight">
            AbrigaPet
          </span>
        </div>

        {/* Lista de Navegação Principal */}
        <nav className="flex flex-row md:flex-col items-center gap-1.5 overflow-x-auto md:overflow-visible">
          
          <Link href="/home" className={getNavItemClass(isPathActive('/home', true))}>
            <span>Início</span>
          </Link>

          <div className={getNavItemClass(isPathActive('/animais'))}>
            <Link href="/animais" className="flex-1 text-left">
              Animais
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                router.push('/animais/new')
              }}
              title="Cadastrar Animal"
              className="p-1 rounded-lg hover:bg-[#755835]/10 text-[#3A250B] transition-colors cursor-pointer"
            >
              <img src="/images/icons/add-button.svg" alt="Adicionar" width={14} height={14} className="invert opacity-80" />
            </button>
          </div>

          <Link href="/comunidade" className={getNavItemClass(isPathActive('/comunidade'))}>
            <span>Comunidade</span>
          </Link>

          <Link href="/saude" className={getNavItemClass(isPathActive('/saude') || isPathActive('/fichamedica'))}>
            <span>Saúde animal</span>
          </Link>

          <Link href="/gatis" className={getNavItemClass(isPathActive('/gatis'))}>
            <span>Gatis</span>
          </Link>

        </nav>
      </div>

      {/* Rodapé Limpo: Apenas o Botão de Sair da Conta */}
      <div className="hidden md:flex flex-col pt-4 border-t border-[#755835]/15 mt-auto">
        <Link
          href="/logout"
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl font-poppins text-sm font-bold text-[#8A3B3B] hover:bg-[#FFF0ED] transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sair da conta</span>
        </Link>
      </div>

    </aside>
  )
}
