export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-dark">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-2xl font-black text-gold">Mundial 2026</h1>
          <p className="text-muted text-sm mt-1">Bolão do Mundial</p>
        </div>
        {children}
      </div>
    </div>
  )
}
