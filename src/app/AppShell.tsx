'use client'

import { MenuNav } from '@/global/ui/MenuNav/MenuNav'
import { usePathname } from 'next/navigation'

function isAuthScreen(pathname: string) {
  return pathname === '/' || pathname === '/login'
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isAuthScreen(pathname)) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      <header className="w-full shrink-0 md:w-56 lg:w-60">
        <MenuNav />
      </header>
      <main className="min-h-screen p-4 pt-20 transition-all sm:p-6 md:ml-56 md:pt-0 lg:ml-60 lg:p-8">{children}</main>
    </>
  )
}
