'use client'

import { Button } from '@/global/ui/Button/Button'
import { useRouter } from 'next/navigation'

export function CommunityActions() {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={() => router.push('/pessoas/new')} green icon="/images/icons/add-button.svg">
        Cadastrar Pessoa
      </Button>
      <Button type="button" onClick={() => router.push('/clinicas/new')} green icon="/images/icons/add-button.svg">
        Cadastrar Clínica
      </Button>
    </div>
  )
}
