'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs bg-surface-2 border border-border px-3 py-2 rounded-lg hover:bg-surface-3 transition-colors"
    >
      {copied ? '✅ Copiado' : 'Copiar'}
    </button>
  )
}
