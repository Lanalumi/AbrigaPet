import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  loadAdocoesDoMes,
  loadAnimaisResumo,
  loadComunidade,
  loadGatis,
  loadMedicacao,
} from '@/modules/home/server/load'
import type { HomeAnimalResumo } from '@/modules/home/types'
import { DashboardCard, ErrorCard, LoadingCard, MetricCard } from './HomePage'
import { AdocoesPanel, CadastrosCard, GatisPanel, MedicacaoPanel } from './HomeActions'

function AnimalMiniCard({ animal }: { animal: HomeAnimalResumo }) {
  const foto = animal.foto?.trim()

  return (
    <Link
      href={`/animais/${animal.id}`}
      className="flex min-w-0 items-center gap-2 rounded-xl border border-[#755835]/15 bg-[#FFF9F7] p-2 transition-colors hover:border-[#755835]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AA36C]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#3A250B]/20 bg-white">
        {foto ? (
          <Image src={foto} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
        ) : (
          <Image src="/images/icons/paw.svg" alt="" width={20} height={20} className="h-5 w-5 opacity-50" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-[#3A250B]">{animal.nome}</span>
        <span className="block truncate text-[11px] font-semibold text-[#755835]/70">
          {animal.sexoLabel} · {animal.especieLabel} · {animal.situacaoLabel}
        </span>
      </span>
    </Link>
  )
}

function AnimaisCard({
  total,
  items = [],
  loading = false,
  error = false,
}: {
  total?: number
  items?: HomeAnimalResumo[]
  loading?: boolean
  error?: boolean
}) {
  return (
    <DashboardCard title="Animais" titleHref={loading ? undefined : '/animais'} className="h-full">
      <Link
        href="/animais"
        className="flex flex-col items-center gap-0.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AA36C]"
      >
        <span className="text-xs font-semibold text-[#755835]/80">Total</span>
        <span className="text-4xl font-extrabold tracking-tight text-[#3A250B]">
          {error ? '—' : loading ? '…' : total}
        </span>
      </Link>
      {error ? (
        <p className="text-center text-sm font-semibold text-[#8A3B3B]">Não foi possível carregar</p>
      ) : loading ? null : items.length === 0 ? (
        <p className="text-center text-sm font-semibold text-[#755835]/70">Nenhum animal cadastrado</p>
      ) : (
        <ul className="flex max-h-44 flex-col gap-2 overflow-y-auto pr-1">
          {items.map((animal) => (
            <li key={animal.id}>
              <AnimalMiniCard animal={animal} />
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}

async function AnimaisMetric() {
  const result = await loadAnimaisResumo()
  if (!result.ok) return <AnimaisCard error />
  return <AnimaisCard total={result.data.total} items={result.data.items} />
}

const comunidadeCards = [
  { title: 'Voluntários', badge: 'Ativos', key: 'voluntarios' },
  { title: 'Adotantes', key: 'adotantes' },
  { title: 'Clínicas', key: 'clinicas' },
] as const

function ComunidadeCard({
  values,
  loading = false,
  error = false,
}: {
  values?: { voluntarios: number; adotantes: number; clinicas: number }
  loading?: boolean
  error?: boolean
}) {
  return (
    <DashboardCard
      title="Comunidade"
      description="Pessoas e clínicas ligadas ao abrigo"
      href="/comunidade"
      className="h-full"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {comunidadeCards.map((card) => (
          <MetricCard
            key={card.key}
            nested
            title={card.title}
            badge={'badge' in card ? card.badge : undefined}
            loading={loading}
            error={error}
            value={values?.[card.key]}
          />
        ))}
      </div>
    </DashboardCard>
  )
}

async function ComunidadeMetrics() {
  const result = await loadComunidade()
  if (!result.ok) return <ComunidadeCard error />
  return <ComunidadeCard values={result.data} />
}

async function MedicacaoSection() {
  const result = await loadMedicacao()
  if (!result.ok) return <ErrorCard title="Medicação pendente" />
  return <MedicacaoPanel gatos={result.data} />
}

async function GatisSection() {
  const result = await loadGatis()
  if (!result.ok) return <ErrorCard title="Gatis" />
  return <GatisPanel gatis={result.data} />
}

async function AdocoesSection() {
  const result = await loadAdocoesDoMes()
  if (!result.ok) return <ErrorCard title="Adoções do mês" />
  return <AdocoesPanel adocoes={result.data} />
}

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8 px-4 py-6 font-poppins sm:py-8">
      <header className="flex flex-col justify-between gap-4 border-b border-[#755835]/15 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#755835]/10 text-[#755835]">
            <Image src="/images/icons/paw2.svg" alt="Patinha" width={26} height={26} className="object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3A250B]">Dashboard</h1>
            <p className="text-xs text-[#755835]/80">Visão geral e acompanhamento em tempo real do abrigo</p>
          </div>
        </div>
      </header>

      {/* Linha 1 de Cards */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(18rem,1.35fr)_minmax(16rem,1.1fr)] lg:gap-6">
        <Suspense fallback={<AnimaisCard loading />}>
          <AnimaisMetric />
        </Suspense>
        <Suspense fallback={<ComunidadeCard loading />}>
          <ComunidadeMetrics />
        </Suspense>
        <Suspense fallback={<LoadingCard title="Medicação pendente" />}>
          <MedicacaoSection />
        </Suspense>
      </div>

      {/* Linha 2 de Cards (Gatis, Adoções e Ações Rápidas Alinhadas) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <Suspense fallback={<LoadingCard title="Gatis" />}>
          <GatisSection />
        </Suspense>
        <Suspense fallback={<LoadingCard title="Adoções do mês" />}>
          <AdocoesSection />
        </Suspense>
        <div className="h-full [&>div]:h-full [&>div]:flex [&>div]:flex-col [&>div]:justify-between">
          <CadastrosCard />
        </div>
      </div>
    </div>
  )
}