import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Mundial 2026 — Bolão',
  description: 'Prevê os resultados do Mundial 2026 e compete com os teus amigos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${geist.variable} h-full`}>
      <body className="min-h-dvh bg-dark text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
