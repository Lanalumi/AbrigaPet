'use client'

import { Button } from '@/global/ui/Button/Button'
import { Card } from '@/global/ui/Card/Card'
import { Modal } from '@/global/ui/Modal/modal'
import type { HomeAdocao, HomeGatil, HomeGato } from '@/modules/home/types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { DashboardCard, EmptyCopy, Total } from './HomePage'

const listClass = 'flex max-h-80 flex-col gap-3 overflow-y-auto pr-1'

const clickableCardClass =
  'cursor-pointer transition-shadow hover:shadow-[2px_6px_16px_rgba(58,37,11,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AA36C]'

const registers = [
  { label: 'Cadastrar Animal', href: '/animais/new' },
  { label: 'Cadastrar Voluntário', href: '/voluntarios/new' },
  { label: 'Cadastrar Adotante', href: '/adotantes/new' },
  { label: 'Cadastrar Pessoa', href: '/pessoas/new' },
  { label: 'Cadastrar Clínica', href: '/clinicas/new' },
  { label: 'Cadastrar Gatil', href: '/gatis/new' },
  { label: 'Nova consulta', href: '/saude/consultas/new' },
  { label: 'Nova medicação', href: '/saude/medicacoes/new' },
] as const

function openOnKey(event: KeyboardEvent, open: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  open()
}

function CatPhoto({ src, nome }: { src: string | null; nome: string }) {
  const imageSrc = src?.trim()

  return (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#3A250B]/30 bg-[#FFF9F7]">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={`Foto de ${nome}`}
          width={112}
          height={112}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <Image src="/images/icons/paw.svg" alt="" width={40} height={40} aria-hidden className="h-10 w-10 opacity-50" />
      )}
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="font-poppins text-sm font-semibold">
      <dt className="inline text-[#755835]/70">{label}: </dt>
      <dd className="inline break-words text-[#755835]">{value}</dd>
    </div>
  )
}

function CatInfo({ gato }: { gato: HomeGato }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CatPhoto src={gato.foto} nome={gato.nome} />
        <dl className="flex min-w-0 flex-1 flex-col gap-1">
          <InfoLine label="Sexo" value={gato.sexoLabel} />
          <InfoLine label="Espécie" value={gato.especieLabel} />
          <InfoLine label="Cor" value={gato.corLabel} />
          <InfoLine label="Raça" value={gato.raca} />
          <InfoLine label="Pelagem" value={gato.pelagemLabel} />
          <InfoLine label="Data de chegada" value={gato.dataChegada} />
          <InfoLine label="Localização" value={gato.localizacaoAtual} />
          <InfoLine label="Situação" value={gato.situacaoLabel} />
          {gato.fivFelv ? (
            <span className="mt-1 w-fit rounded-md bg-[#FFA686] px-2 py-0.5 font-poppins text-xs font-semibold text-white">
              FIV/FeLV
            </span>
          ) : null}
        </dl>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-poppins text-base font-bold text-[#755835]">Medicação</h2>
        {gato.medicamentos.length === 0 ? (
          <p className="font-poppins text-sm font-semibold text-[#755835]/70">Nenhuma medicação pendente</p>
        ) : (
          gato.medicamentos.map((medicamento) => (
            <article key={medicamento.id} className="rounded-md border border-[#3A250B]/30 bg-[#FFF9F7] p-3">
              <h3 className="font-poppins text-base font-bold text-[#755835]">{medicamento.nome}</h3>
              <dl className="mt-2 flex flex-col gap-1">
                <InfoLine label="Dosagem" value={medicamento.dosagem} />
                <InfoLine label="Frequência" value={medicamento.frequencia} />
                <InfoLine label="Duração" value={medicamento.duracaoTratamento} />
                <InfoLine label="Próxima dose" value={medicamento.proximaDose} />
              </dl>
            </article>
          ))
        )}
      </section>

      <Link
        href={`/animais/${gato.id}/fichamedica`}
        className="w-fit font-poppins text-sm font-semibold text-[#8AA36C] hover:underline"
      >
        Ficha médica completa
      </Link>
    </div>
  )
}

function CatModal({ gato, onClose }: { gato: HomeGato | null; onClose: () => void }) {
  return (
    <Modal
      title={gato?.nome ?? 'Gato'}
      isOpen={gato !== null}
      onClose={onClose}
      body={gato ? <CatInfo gato={gato} /> : null}
    />
  )
}

export function MedicacaoPanel({ gatos }: { gatos: HomeGato[] }) {
  const [gato, setGato] = useState<HomeGato | null>(null)

  return (
    <DashboardCard
      title="Medicação pendente"
      description="Acompanhe os gatos com tratamento em andamento"
      className="h-full"
    >
      <Total value={gatos.length} />
      {gatos.length === 0 ? (
        <EmptyCopy>Nenhum gato com medicação pendente</EmptyCopy>
      ) : (
        <ul className={listClass}>
          {gatos.map((item) => (
            <li key={item.id}>
              <Card
                title={item.nome}
                image={{ src: item.foto, alt: `Foto de ${item.nome}` }}
                infos={[
                  { label: 'Medicamento', value: item.medicineLabel },
                  { label: 'Próxima dose', value: item.proximaDoseLabel },
                ]}
                role="button"
                tabIndex={0}
                aria-label={`Ver informações de ${item.nome}`}
                className={clickableCardClass}
                onClick={() => setGato(item)}
                onKeyDown={(event) => openOnKey(event, () => setGato(item))}
              />
            </li>
          ))}
        </ul>
      )}
      <CatModal gato={gato} onClose={() => setGato(null)} />
    </DashboardCard>
  )
}

export function GatisPanel({ gatis }: { gatis: HomeGatil[] }) {
  const [gatil, setGatil] = useState<HomeGatil | null>(null)
  const [gato, setGato] = useState<HomeGato | null>(null)

  function closeGatil() {
    setGatil(null)
    setGato(null)
  }

  return (
    <DashboardCard title="Gatis" description="Locais cadastrados e os gatos que estão em cada um" className="h-full">
      {gatis.length === 0 ? (
        <EmptyCopy>Nenhum gatil cadastrado</EmptyCopy>
      ) : (
        <ul className={listClass}>
          {gatis.map((item) => (
            <li key={item.id}>
              <Card
                title={item.nome}
                infos={[
                  { label: 'Tipo de local', value: item.tipoLocal },
                  { label: 'Animais no local', value: String(item.totalAnimais) },
                ]}
                role="button"
                tabIndex={0}
                aria-label={`Ver gatos em ${item.nome}`}
                className={clickableCardClass}
                onClick={() => setGatil(item)}
                onKeyDown={(event) => openOnKey(event, () => setGatil(item))}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        title={gatil?.nome ?? 'Gatil'}
        isOpen={gatil !== null}
        onClose={closeGatil}
        body={
          gatil && gatil.gatos.length === 0 ? (
            <EmptyCopy>Nenhum gato neste gatil</EmptyCopy>
          ) : (
            <ul className="flex flex-col gap-3">
              {gatil?.gatos.map((item) => (
                <li key={item.id}>
                  <Card
                    title={item.nome}
                    image={{ src: item.foto, alt: `Foto de ${item.nome}` }}
                    infos={[
                      { label: 'Sexo', value: item.sexoLabel },
                      { label: 'Localização', value: item.localizacaoAtual },
                    ]}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver informações de ${item.nome}`}
                    className={clickableCardClass}
                    onClick={() => setGato(item)}
                    onKeyDown={(event) => openOnKey(event, () => setGato(item))}
                  />
                </li>
              ))}
            </ul>
          )
        }
      />
      <CatModal gato={gato} onClose={() => setGato(null)} />
    </DashboardCard>
  )
}

export function AdocoesPanel({ adocoes }: { adocoes: HomeAdocao[] }) {
  const [adocao, setAdocao] = useState<HomeAdocao | null>(null)

  return (
    <DashboardCard title="Adoções do mês" description="Animais que saíram por adoção neste mês" className="h-full">
      {adocoes.length === 0 ? (
        <EmptyCopy>Nenhuma adoção neste mês</EmptyCopy>
      ) : (
        <ul className={listClass}>
          {adocoes.map((item) => (
            <li key={item.id}>
              <Card
                title={item.animal.nome}
                image={{ src: item.animal.foto, alt: `Foto de ${item.animal.nome}` }}
                infos={[
                  { label: 'Adotante', value: item.adotante?.nome },
                  { label: 'Data', value: item.dataAdocao },
                ]}
                role="button"
                tabIndex={0}
                aria-label={`Ver adoção de ${item.animal.nome}`}
                className={clickableCardClass}
                onClick={() => setAdocao(item)}
                onKeyDown={(event) => openOnKey(event, () => setAdocao(item))}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        title={adocao ? `Adoção de ${adocao.animal.nome}` : 'Adoção'}
        isOpen={adocao !== null}
        onClose={() => setAdocao(null)}
        body={
          adocao ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <CatPhoto src={adocao.animal.foto} nome={adocao.animal.nome} />
                <dl className="flex min-w-0 flex-1 flex-col gap-1">
                  <InfoLine label="Animal" value={adocao.animal.nome} />
                  <InfoLine label="Espécie" value={adocao.animal.especieLabel} />
                  <InfoLine label="Situação" value={adocao.animal.situacaoLabel} />
                </dl>
              </div>
              {adocao.adotante ? (
                <section className="flex flex-col gap-1">
                  <h2 className="font-poppins text-base font-bold text-[#755835]">Adotante</h2>
                  <dl className="flex flex-col gap-1">
                    <InfoLine label="Nome" value={adocao.adotante.nome} />
                    <InfoLine label="Telefone" value={adocao.adotante.telefone} />
                    <InfoLine label="Cidade" value={adocao.adotante.cidade} />
                    <InfoLine label="Rua" value={adocao.adotante.rua} />
                    <InfoLine label="Número" value={adocao.adotante.numero} />
                    <InfoLine label="Bairro" value={adocao.adotante.bairro} />
                  </dl>
                </section>
              ) : null}
              <dl>
                <InfoLine label="Data da adoção" value={adocao.dataAdocao} />
              </dl>
            </div>
          ) : null
        }
      />
    </DashboardCard>
  )
}

export function CadastrosCard() {
  const router = useRouter()

  return (
    <DashboardCard title="Ações rápidas" description="Atalhos para cadastros frequentes no abrigo" className="h-full">
      <div className="mt-2 grid grid-cols-2 gap-3 [&_button]:w-full [&_button]:h-full [&_button]:min-h-[44px]">
        {registers.map((item) => (
          <Button
            key={item.href}
            type="button"
            green
            fill
            icon="/images/icons/add-button.svg"
            onClick={() => router.push(item.href)}
            className="w-full text-[11px] sm:text-xs"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </DashboardCard>
  )
}