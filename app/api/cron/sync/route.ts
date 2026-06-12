import { runSync } from '@/lib/sync'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSync()
    return Response.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/sync]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
