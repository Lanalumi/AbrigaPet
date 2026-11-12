import Link from 'next/link'
import { Card } from '@/global/ui/Card/Card'
import { Animal } from '../../types'

type AnimalCardsProps = {
  items: Animal[]
}

function formatArrivalDate(value: Animal['dataChegada'] | string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export default function AnimalCards({ items }: AnimalCardsProps) {
  return (
    <ul className="flex w-full max-w-3xl flex-col gap-3">
      {items.map((animal) => (
        <li key={animal.id}>
          <Card
            className="relative cursor-pointer transition-shadow hover:shadow-[2px_6px_16px_rgba(58,37,11,0.16)]"
            title={
              <span className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/animais/${animal.id}`}
                  className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AA36C] after:absolute after:inset-0 after:content-['']"
                >
                  {animal.nome}
                </Link>
                {animal.fivFelv ? (
                  <span className="rounded-md bg-[#FFA686] px-2 py-0.5 font-poppins text-xs font-semibold text-white">
                    FIV/FeLV
                  </span>
                ) : null}
              </span>
            }
            image={{
              src: animal.foto,
              alt: `Foto de ${animal.nome}`,
            }}
            infos={[
              { label: 'Data de chegada', value: formatArrivalDate(animal.dataChegada) },
              { label: 'Sexo', value: animal.sexo ? 'Macho' : 'Fêmea' },
              { label: 'Localização', value: animal.localizacaoAtual?.trim() || 'Não informada' },
            ]}
          >
            <Link
              href={`/animais/${animal.id}/fichamedica`}
              className="relative z-10 mt-1 inline-flex w-fit items-center justify-center rounded-[10px] bg-[#8AA36C] px-4 py-2 font-poppins text-[14px] font-semibold text-white"
            >
              Ficha médica
            </Link>
          </Card>
        </li>
      ))}
    </ul>
  )
}
