import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { entrarLiga } from '@/lib/actions/ligas'
import Link from 'next/link'

interface Props {
  params: Promise<{ codigo: string }>
}

export default async function EntrarLigaPage({ params }: Props) {
  const { codigo } = await params
  const session = await auth()

  const liga = await prisma.liga.findUnique({
    where: { codigoConvite: codigo.toUpperCase() },
    include: { _count: { select: { membros: true } }, criador: true },
  })

  if (!liga) {
    return (
      <div className="max-w-sm mx-auto text-center py-12 space-y-4">
        <div className="text-5xl">❌</div>
        <h1 className="text-xl font-bold">Código inválido</h1>
        <p className="text-muted text-sm">Este código de convite não existe.</p>
        <Link href="/" className="text-gold hover:underline text-sm">Voltar ao início</Link>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="max-w-sm mx-auto py-12 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h1 className="text-xl font-bold">{liga.nome}</h1>
          <p className="text-muted text-sm mt-1">
            {liga._count.membros} membros · Criada por {liga.criador.nome}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center space-y-3">
          <p className="text-sm text-muted">Inicia sessão para entrar nesta liga</p>
          <Link
            href={`/login?next=/ligas/entrar/${codigo}`}
            className="block w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors text-center"
          >
            Entrar / Criar conta
          </Link>
        </div>
      </div>
    )
  }

  // Auto-join
  const result = await entrarLiga(codigo)
  if (result?.error === 'Já és membro desta liga.') {
    redirect(`/ligas/${liga.id}`)
  }
  if (result?.error) {
    return (
      <div className="max-w-sm mx-auto text-center py-12 space-y-4">
        <p className="text-red">{result.error}</p>
        <Link href="/ligas" className="text-gold hover:underline text-sm">As minhas ligas</Link>
      </div>
    )
  }

  redirect(`/ligas/${liga.id}`)
}
