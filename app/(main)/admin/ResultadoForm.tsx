'use client'

import { useState, useTransition } from 'react'
import { atualizarResultado } from '@/lib/actions/admin'

interface Jogo {
  id: string
  equipaCasa: string
  equipaFora: string
  golosCasa: number | null
  golosFora: number | null
  encerrado: boolean
  data: Date
  grupo: string | null
  fase: string
}

export function ResultadoForm({ jogo }: { jogo: Jogo }) {
  const [casa, setCasa] = useState(jogo.golosCasa?.toString() ?? '')
  const [fora, setFora] = useState(jogo.golosFora?.toString() ?? '')
  const [encerrado, setEncerrado] = useState(jogo.encerrado)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const gc = parseInt(casa)
    const gf = parseInt(fora)
    if (isNaN(gc) || isNaN(gf)) return
    setSaved(false)
    startTransition(async () => {
      await atualizarResultado(jogo.id, gc, gf, encerrado)
      setSaved(true)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="w-32 text-right truncate text-muted">{jogo.equipaCasa}</span>
      <input
        type="number" min="0" max="30" value={casa}
        onChange={e => { setCasa(e.target.value); setSaved(false) }}
        className="w-12 text-center bg-surface-2 border border-border rounded-lg p-1 font-bold"
      />
      <span className="text-muted">–</span>
      <input
        type="number" min="0" max="30" value={fora}
        onChange={e => { setFora(e.target.value); setSaved(false) }}
        className="w-12 text-center bg-surface-2 border border-border rounded-lg p-1 font-bold"
      />
      <span className="w-32 truncate text-muted">{jogo.equipaFora}</span>
      <label className="flex items-center gap-1 text-xs text-muted cursor-pointer">
        <input type="checkbox" checked={encerrado} onChange={e => { setEncerrado(e.target.checked); setSaved(false) }} />
        Finished
      </label>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-3 py-1 bg-gold text-dark text-xs font-bold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? '…' : saved ? '✓' : 'Save'}
      </button>
    </div>
  )
}
