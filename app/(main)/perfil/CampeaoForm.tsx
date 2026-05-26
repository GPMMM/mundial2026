'use client'

import { useState, useTransition } from 'react'
import { guardarCampeao } from '@/lib/actions/previsoes'
import Image from 'next/image'
import { urlBandeira } from '@/lib/flags'

interface Equipa {
  nome: string
  id: number | null
}

interface Props {
  campeaoAtual: string | null
  campeaoIdAtual: number | null
  equipas: Equipa[]
}

export function CampeaoForm({ campeaoAtual, campeaoIdAtual, equipas }: Props) {
  const [selected, setSelected] = useState<Equipa | null>(
    campeaoAtual ? { nome: campeaoAtual, id: campeaoIdAtual } : null
  )
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await guardarCampeao(fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <section>
      <h2 className="font-bold text-lg mb-1">🏆 Champion Prediction</h2>
      <p className="text-muted text-xs mb-3">Get it right and earn +20 bonus points!</p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-4 space-y-3">
        {selected && (() => {
          const src = urlBandeira(selected.nome, 40)
          return (
            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg border border-gold/30">
              {src
                ? <Image src={src} alt={selected.nome} width={40} height={27} className="rounded-sm object-cover" unoptimized />
                : <span className="text-2xl">🏳️</span>
              }
              <span className="font-semibold">{selected.nome}</span>
            </div>
          )
        })()}

        <select
          name="campeao"
          value={selected?.nome ?? ''}
          onChange={e => {
            const equipa = equipas.find(eq => eq.nome === e.target.value) ?? null
            setSelected(equipa)
          }}
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
        >
          <option value="">Choose team…</option>
          {equipas.map(eq => (
            <option key={eq.nome} value={eq.nome}>{eq.nome}</option>
          ))}
        </select>

        <input type="hidden" name="campeaoId" value={selected?.id ?? ''} />

        {saved && <p className="text-green text-sm">✅ Saved!</p>}

        <button
          type="submit" disabled={isPending}
          className="w-full py-2.5 text-sm bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save prediction'}
        </button>
      </form>
    </section>
  )
}
