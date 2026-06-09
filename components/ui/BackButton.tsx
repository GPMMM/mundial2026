'use client'

import { useRouter } from 'next/navigation'

interface Props {
  fallback?: string
  label?: string
}

export function BackButton({ fallback = '/jogos', label = '← Back' }: Props) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-muted hover:text-white transition-colors"
    >
      {label}
    </button>
  )
}
