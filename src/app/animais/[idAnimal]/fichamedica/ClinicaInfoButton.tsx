'use client'

import { useEffect, useId, useRef, useState } from 'react'

export type ClinicaInfo = {
  nome: string
  cnpj: string
  telefone: string
  rua: string
  numero: number
  bairro: string
  cidade: string
}

type ClinicaInfoButtonProps = {
  clinica: ClinicaInfo
}

export function ClinicaInfoButton({ clinica }: ClinicaInfoButtonProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const details = [
    { label: 'CNPJ', value: clinica.cnpj },
    { label: 'Telefone', value: clinica.telefone },
    { label: 'Endereço', value: `${clinica.rua}, ${clinica.numero}` },
    { label: 'Bairro', value: clinica.bairro },
    { label: 'Cidade', value: clinica.cidade },
  ]

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="cursor-pointer text-left font-poppins text-base font-semibold text-[#8AA36C] underline decoration-[#8AA36C]/40 underline-offset-2 hover:text-[#755835]"
      >
        {clinica.nome}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A250B]/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-xl border border-[#3A250B]/30 bg-[#FFF9F7] p-6 shadow-[2px_4px_14px_rgba(58,37,11,0.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId} className="font-poppins text-xl font-bold text-[#755835]">
              {clinica.nome}
            </h2>
            <dl className="mt-4 flex flex-col gap-2">
              {details.map((detail) => (
                <div key={detail.label} className="font-poppins text-sm font-semibold">
                  <dt className="inline text-[#755835]/70">{detail.label}: </dt>
                  <dd className="inline break-words text-[#755835]">{detail.value}</dd>
                </div>
              ))}
            </dl>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 cursor-pointer rounded-[10px] bg-[#8AA36C] px-4 py-2 font-poppins text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
