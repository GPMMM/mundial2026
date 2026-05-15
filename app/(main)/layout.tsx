import { Header } from '@/components/navigation/Header'
import { BottomNav } from '@/components/navigation/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
