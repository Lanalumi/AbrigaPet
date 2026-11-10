'use client'

import { AuthScreen } from '@/app/auth/AuthScreen'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { FormEvent, useState } from 'react'

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

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Email ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <AuthScreen title="AbrigaPet" subtitle="Entre na sua conta">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div
          aria-label="email"
          className="flex items-center gap-3 rounded-xl border border-[#3A250B]/20 bg-white px-4 py-3"
        >
          <Image src="/images/email.svg" width={18} height={18} alt="icone de email" />
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            className="w-full bg-transparent text-sm font-medium text-[#3A250B] outline-none"
            required
          />
        </div>

        <div aria-label="senha" className="flex items-center gap-3 rounded-xl border border-[#3A250B]/20 bg-white px-4 py-3">
          <Image src="/images/senha.svg" width={18} height={18} alt="icone de senha" />
          <input
            name="password"
            type="password"
            placeholder="Senha"
            className="w-full bg-transparent text-sm font-medium text-[#3A250B] outline-none"
            required
          />
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
    </AuthScreen>
  )
}
