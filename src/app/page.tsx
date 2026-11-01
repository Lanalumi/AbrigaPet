'use client'

import { setMockSession } from '@/lib/mock-auth'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const MOCK_EMAIL = 'admin@abrigapet.com'
const MOCK_PASSWORD = '123456'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
      .trim()
      .toLowerCase()
    const password = String(form.get('password') ?? '')

    await new Promise((resolve) => setTimeout(resolve, 300))

    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setMockSession({ email, name: 'Admin' })
      router.push('/home')
      router.refresh()
      return
    }

    setError('Email ou senha invalidos.')
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FFF9F7] p-6">
      <div className="w-full max-w-lg rounded-3xl border-2 border-[#3A250B]/[30%] bg-white/90 p-8 shadow-md backdrop-blur">
        <div className="mb-8 flex flex-col items-center gap-2" aria-label="icone">
          <Image width={72} height={72} src="/images/icone.svg" alt="Icone AbrigaPet" />
          <h1 className="text-3xl font-bold text-[#3A250B] font-poppins">AbrigaPet</h1>
          <p className="text-sm font-medium text-[#3A250B]/70 font-poppins">Entre na sua conta</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div aria-label="email" className="flex items-center gap-3 rounded-xl border border-[#3A250B]/20 px-4 py-3 bg-white">
            <Image src="/images/email.svg" width={18} height={18} alt="icone de email" />
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              className="w-full bg-transparent text-sm font-medium outline-none text-[#3A250B]"
              required
            />
          </div>

          <div aria-label="senha" className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-[#3A250B]/20 px-4 py-3 bg-white">
              <Image src="/images/senha.svg" width={18} height={18} alt="icone de senha" />
              <input
                name="password"
                type="password"
                placeholder="Senha"
                className="w-full bg-transparent text-sm font-medium outline-none text-[#3A250B]"
                required
              />
            </div>
            <a className="block cursor-pointer text-right text-xs font-semibold text-[#3A250B]/70 hover:underline">Esqueceu a senha?</a>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="mt-2 w-full cursor-pointer rounded-xl bg-[#3A250B] p-3.5 font-poppins text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-[#3A250B]/70">Mock login: admin@abrigapet.com / 123456</p>
      </div>

      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/background-login.png')] bg-bottom bg-no-repeat bg-size-[100%_auto]"
        aria-hidden
      />
    </div>
  )
}