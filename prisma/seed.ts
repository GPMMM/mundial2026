import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@mundial2026.com' },
    update: {},
    create: {
      nome: 'Admin',
      email: 'admin@mundial2026.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created: admin@mundial2026.com / admin123')

  // Sync fixtures from API-Football
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) {
    console.warn('⚠️  API_FOOTBALL_KEY not set — skipping fixture sync')
    return
  }

  console.log('📡 Fetching fixtures from API-Football...')
  const res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
    headers: { 'x-apisports-key': apiKey },
  })

  if (!res.ok) {
    console.error(`❌ API error: ${res.status}`)
    return
  }

  const data = await res.json()
  const fixtures = data.response ?? []
  console.log(`📋 ${fixtures.length} fixtures found`)

  let created = 0
  let updated = 0

  for (const f of fixtures) {
    const round: string = f.league.round ?? ''
    const fase = parseFase(round)
    const grupo = f.league.group
      ? (f.league.group as string).replace(/^Group\s*/i, '').toUpperCase()
      : parseGrupo(round)

    const existing = await prisma.jogo.findUnique({ where: { fixtureId: f.fixture.id } })
    const encerrado = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)

    if (existing) {
      await prisma.jogo.update({
        where: { fixtureId: f.fixture.id },
        data: {
          data: new Date(f.fixture.date),
          fase,
          grupo,
          golosCasa: f.goals.home,
          golosFora: f.goals.away,
          encerrado,
        },
      })
      updated++
    } else {
      await prisma.jogo.create({
        data: {
          fixtureId: f.fixture.id,
          equipaCasa: f.teams.home.name,
          equipaFora: f.teams.away.name,
          equipaCasaId: f.teams.home.id,
          equipaForaId: f.teams.away.id,
          paisCasa: f.teams.home.name,
          paisFora: f.teams.away.name,
          data: new Date(f.fixture.date),
          fase,
          grupo,
          golosCasa: f.goals.home,
          golosFora: f.goals.away,
          encerrado,
        },
      })
      created++
    }
  }

  console.log(`✅ Fixtures: ${created} created, ${updated} updated`)
}

function parseFase(round: string): 'GRUPOS' | 'OITAVOS' | 'QUARTOS' | 'MEIAS' | 'FINAL' {
  const r = round.toLowerCase()
  if (r.includes('group')) return 'GRUPOS'
  if (r.includes('round of 16') || r.includes('1/8') || r.includes('round of sixteen')) return 'OITAVOS'
  if (r.includes('quarter')) return 'QUARTOS'
  if (r.includes('semi')) return 'MEIAS'
  if (r.includes('final')) return 'FINAL'
  return 'GRUPOS'
}

function parseGrupo(round: string): string | null {
  const match = round.match(/group\s+([a-l])/i)
  return match ? match[1].toUpperCase() : null
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
