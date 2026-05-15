import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'World Cup 2026 — Predictions',
  description: 'Predict the World Cup 2026 results and compete with your friends.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${geist.variable} h-full`}>
      <body className="min-h-dvh bg-dark text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
