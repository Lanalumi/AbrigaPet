import Image from 'next/image'

export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FFF9F7] p-6">
      <div className="w-full max-w-lg rounded-3xl border-2 border-[#3A250B]/[30%] bg-white/90 p-8 shadow-md backdrop-blur">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Image width={72} height={72} src="/images/icone.svg" alt="Icone AbrigaPet" />
          <h1 className="font-poppins text-3xl font-bold text-[#3A250B]">{title}</h1>
          <p className="font-poppins text-sm font-medium text-[#3A250B]/70">{subtitle}</p>
        </div>
        {children}
      </div>

      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/background-login.png')] bg-bottom bg-no-repeat bg-size-[100%_auto]"
        aria-hidden
      />
    </div>
  )
}
