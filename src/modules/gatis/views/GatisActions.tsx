'use client'

import { Button } from '@/global/ui/Button/Button'
import { useRouter } from 'next/navigation'

export function GatisActions() {
  const router = useRouter()

  return (
    <div className="flex justify-end py-4">
      <Button type="button" onClick={() => router.push('/gatis/new')} green icon="/images/icons/add-button.svg">
        Cadastrar Gatil
      </Button>
    </div>
  )
}
