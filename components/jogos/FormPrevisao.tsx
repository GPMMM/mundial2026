'use client'

import { useState, useTransition } from 'react'
import { guardarPrevisao } from '@/lib/actions/previsoes'
import { Confetti } from '@/components/ui/Confetti'
import type { Previsao } from '@prisma/client'

interface Jogador {
  id: number
  name: string
  pos: string
  number: number
}

interface Props {
  jogoId: string
  equipaCasa: string
  equipaFora: string
  previsaoAtual: Previsao | null
  jogadoresCasa: Jogador[]
  jogadoresFora: Jogador[]
  fechado: boolean
}

export function FormPrevisao({
  jogoId, equipaCasa, equipaFora, previsaoAtual, jogadoresCasa, jogadoresFora, fechado,
}: Props) {
  const [gcasa, setGcasa] = useState(previsaoAtual?.golosCasa ?? 0)
  const [gfora, setGfora] = useState(previsaoAtual?.golosFora ?? 0)
  const [mCasa, setMCasa] = useState(previsaoAtual?.marcadorCasa ?? '')
  const [mFora, setMFora] = useState(previsaoAtual?.marcadorFora ?? '')
  const [isPending, startTransition] = useTransition()
  const [resultado, setResultado] = useState<{ success?: boolean; error?: string } | null>(null)
  const [confetti, setConfetti] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await guardarPrevisao(fd)
      setResultado(res ?? { success: true })
      if (res?.success || !res?.error) setConfetti(true)
    })
  }

  if (fechado) {
    return (
      <div className="bg-surface-2 rounded-xl p-4 border border-border text-center text-muted text-sm">
        🔒 Predictions closed — match has started
      </div>
    )
  }

  return (
    <>
      <Confetti trigger={confetti} onDone={() => setConfetti(false)} />
      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-5 space-y-5">
        <h3 className="font-bold text-lg">Your prediction</h3>

        <div className="flex items-center gap-4 justify-center">
          <div className="flex-1 text-right">
            <span className="text-sm text-muted block mb-1">{equipaCasa}</span>
            <input
              type="number" name="golosCasa" min={0} max={99}
              value={gcasa} onChange={e => setGcasa(+e.target.value)}
              className="w-20 text-center text-3xl font-black bg-surface-2 border border-border rounded-lg p-2 text-gold focus:outline-none focus:border-gold ml-auto block"
            />
          </div>
          <span className="text-2xl font-black text-muted mt-5">–</span>
          <div className="flex-1">
            <span className="text-sm text-muted block mb-1">{equipaFora}</span>
            <input
              type="number" name="golosFora" min={0} max={99}
              value={gfora} onChange={e => setGfora(+e.target.value)}
              className="w-20 text-center text-3xl font-black bg-surface-2 border border-border rounded-lg p-2 text-gold focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <input type="hidden" name="jogoId" value={jogoId} />

        {(jogadoresCasa.length > 0 || jogadoresFora.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Goalscorer {equipaCasa}</label>
              <select
                name="marcadorCasa" value={mCasa} onChange={e => setMCasa(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">None</option>
                {jogadoresCasa.map(j => (
                  <option key={j.id} value={j.name}>{j.number}. {j.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Goalscorer {equipaFora}</label>
              <select
                name="marcadorFora" value={mFora} onChange={e => setMFora(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">None</option>
                {jogadoresFora.map(j => (
                  <option key={j.id} value={j.name}>{j.number}. {j.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {resultado?.error && (
          <p className="text-red text-sm bg-red/10 border border-red/20 rounded-lg px-3 py-2">{resultado.error}</p>
        )}
        {resultado?.success && (
          <p className="text-green text-sm bg-green/10 border border-green/20 rounded-lg px-3 py-2">✅ Prediction saved!</p>
        )}

        <button
          type="submit" disabled={isPending}
          className="w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : previsaoAtual ? 'Update prediction' : 'Save prediction'}
        </button>
      </form>
    </>
  )
}
