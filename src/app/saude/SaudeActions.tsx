'use client'

import { Button } from '@/global/ui/Button/Button'
import { useRouter } from 'next/navigation'

export function SaudeActions() {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={() => router.push('/saude/consultas/new')} green icon="/images/icons/add-button.svg">
        Nova consulta
      </Button>
      <Button
        type="button"
        onClick={() => router.push('/saude/medicacoes/new')}
        green
        icon="/images/icons/add-button.svg"
      >
        Nova medicação
      </Button>
    </div>
  )
}
