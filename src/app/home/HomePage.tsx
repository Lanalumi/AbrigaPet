import Link from 'next/link'
import type { ReactNode } from 'react'

const panelClass =
  'flex h-full min-w-0 flex-col gap-4 rounded-3xl border border-[#755835]/20 bg-white p-6 font-poppins shadow-[0_10px_30px_rgba(58,37,11,0.05)]'

const clickableClass =
  'cursor-pointer hover:border-[#755835]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AA36C]'

export function DashboardCard({
  title,
  description,
  children,
  className = '',
  href,
  titleHref,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  href?: string
  titleHref?: string
}) {
  const classes = `${panelClass} ${href ? clickableClass : ''} ${className}`.trim()
  const body = (
    <>
      <div>
        <h2 className="text-lg font-bold text-[#3A250B]">
          {titleHref ? (
            <Link
              href={titleHref}
              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AA36C]"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {description ? <p className="mt-0.5 text-xs text-[#755835]/80">{description}</p> : null}
      </div>
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    )
  }

  return <section className={classes}>{body}</section>
}

export function MetricCard({
  title,
  badge,
  value,
  loading = false,
  error = false,
  nested = false,
  className = '',
  href,
}: {
  title: string
  badge?: string
  value?: number
  loading?: boolean
  error?: boolean
  nested?: boolean
  className?: string
  href?: string
}) {
  const surface = nested
    ? 'rounded-2xl border border-[#755835]/15 bg-[#FFF9F7] p-4 shadow-none'
    : 'rounded-3xl border border-[#755835]/20 bg-white p-5 shadow-[0_10px_30px_rgba(58,37,11,0.05)]'

  const layout = nested ? 'flex-row items-center justify-between gap-3' : 'flex-col justify-between gap-4'
  const classes =
    `flex min-w-0 font-poppins transition-all hover:border-[#755835]/40 ${layout} ${surface} ${href ? clickableClass : ''} ${className}`.trim()

  const header = (
    <div className={`flex min-w-0 items-center gap-2 ${nested ? '' : 'justify-between'}`}>
      <span className="min-w-0 truncate text-xs font-semibold text-[#755835]/80">{title}</span>
      {badge ? (
        <span className="shrink-0 rounded-full bg-[#755835]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#755835]">
          {badge}
        </span>
      ) : null}
    </div>
  )
  const errorCopy = error ? <p className="text-xs font-semibold text-[#8A3B3B]">Não foi possível carregar</p> : null
  const total = (
    <div className={`shrink-0 font-extrabold tracking-tight text-[#3A250B] ${nested ? 'text-2xl' : 'text-3xl'}`}>
      {error ? '—' : loading ? '…' : value}
    </div>
  )

  const body = nested ? (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        {header}
        {errorCopy}
      </div>
      {total}
    </>
  ) : (
    <>
      {header}
      {total}
      {errorCopy}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    )
  }

  return <div className={classes}>{body}</div>
}

export function Total({ value, className = 'text-3xl' }: { value: number; className?: string }) {
  return <p className={`font-extrabold tracking-tight text-[#3A250B] ${className}`}>{value}</p>
}

export function LoadingCard({ title }: { title: string }) {
  return (
    <DashboardCard title={title} className="h-full">
      <p className="text-sm font-semibold text-[#755835]/70">Carregando…</p>
    </DashboardCard>
  )
}

export function ErrorCard({ title }: { title: string }) {
  return (
    <DashboardCard title={title} className="h-full">
      <p className="text-sm font-semibold text-[#8A3B3B]">Não foi possível carregar</p>
    </DashboardCard>
  )
}

export function EmptyCopy({ children }: { children: string }) {
  return <p className="text-sm font-semibold text-[#755835]/70">{children}</p>
}
