'use client'

import { useTransition } from 'react'
import { removerMembro } from '@/lib/actions/ligas'

export function RemoverMembroBtn({ ligaId, userId }: { ligaId: string; userId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleRemover() {
    if (!confirm('Remover este membro?')) return
    startTransition(async () => {
      await removerMembro(ligaId, userId)
    })
  }

  return (
    <button
      onClick={handleRemover} disabled={isPending}
      className="text-xs text-red hover:text-red/80 transition-colors disabled:opacity-50"
    >
      {isPending ? '…' : 'Remover'}
    </button>
  )
}
