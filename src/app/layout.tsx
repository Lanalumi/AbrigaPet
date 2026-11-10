import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/app/AppShell'
import { QueryProvider } from '@/global/providers/QueryProvider'
import { ToastProvider } from '@/global/providers/ToastProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-family-poppins',
  display: 'swap',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AbrigaPet',
  description: 'Plataforma para ONGs de resgate de animais',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="bg-[#FFF9F7] font-poppins min-h-screen text-[#3A250B]">
        <QueryProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
