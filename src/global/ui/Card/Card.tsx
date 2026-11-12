import { ComponentProps, ReactNode } from 'react'

export type CardInfo = {
  label: string
  value?: ReactNode
}

type CardProps = Omit<ComponentProps<'article'>, 'title'> & {
  title: ReactNode
  image?: {
    src?: string | null
    alt: string
  }
  infos?: CardInfo[]
}

function hasInfoValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== ''
}

export const Card = ({ title, image, infos = [], children, className = '', ...articleProps }: CardProps) => {
  const visibleInfos = infos.filter((info) => hasInfoValue(info.value))
  const imageSrc = image?.src?.trim()

  return (
    <article
      className={`flex w-full flex-col gap-4 rounded-xl border border-[#3A250B]/30 bg-white p-4 shadow-[2px_4px_14px_rgba(58,37,11,0.1)] sm:flex-row sm:items-start ${className}`.trim()}
      {...articleProps}
    >
      {image && (
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#3A250B]/30 bg-[#FFF9F7]">
          {imageSrc ? (
            <img src={imageSrc} alt={image.alt} className="h-full w-full object-cover" />
          ) : (
            <img src="/images/icons/paw.svg" alt="" className="h-10 w-10 opacity-50" aria-hidden />
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="font-poppins text-lg font-bold text-[#755835]">{title}</h2>

        {visibleInfos.length > 0 && (
          <dl className="flex flex-col gap-1">
            {visibleInfos.map((info, index) => (
              <div key={`${info.label}-${index}`} className="font-poppins text-sm font-semibold">
                <dt className="inline text-[#755835]/70">{info.label}: </dt>
                <dd className="inline break-words text-[#755835]">{info.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </article>
  )
}
