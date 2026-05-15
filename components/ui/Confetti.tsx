'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function Confetti({ trigger, onDone }: { trigger: boolean; onDone?: () => void }) {
  useEffect(() => {
    if (!trigger) return
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00A550', '#ffffff', '#3b82f6'],
    })
    const t = setTimeout(() => onDone?.(), 3000)
    return () => clearTimeout(t)
  }, [trigger, onDone])

  return null
}
