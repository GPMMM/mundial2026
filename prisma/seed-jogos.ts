import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// FIFA World Cup 2026 — Group Stage fixtures (partial, confirmed)
// Source: FIFA official calendar
const JOGOS = [
  // Grupo A
  { fixtureId: 1100001, casa: 'México', fora: 'Equador', casaId: 16, foraId: 14, pais: ['México','Equador'], data: '2026-06-11T20:00:00Z', grupo: 'A' },
  { fixtureId: 1100002, casa: 'Estados Unidos', fora: 'Panamá', casaId: 2, foraId: 95, pais: ['EUA','Panamá'], data: '2026-06-12T00:00:00Z', grupo: 'A' },
  { fixtureId: 1100003, casa: 'México', fora: 'Panamá', casaId: 16, foraId: 95, pais: ['México','Panamá'], data: '2026-06-16T00:00:00Z', grupo: 'A' },
  { fixtureId: 1100004, casa: 'Estados Unidos', fora: 'Equador', casaId: 2, foraId: 14, pais: ['EUA','Equador'], data: '2026-06-16T23:00:00Z', grupo: 'A' },
  { fixtureId: 1100005, casa: 'Equador', fora: 'Panamá', casaId: 14, foraId: 95, pais: ['Equador','Panamá'], data: '2026-06-20T23:00:00Z', grupo: 'A' },
  { fixtureId: 1100006, casa: 'Estados Unidos', fora: 'México', casaId: 2, foraId: 16, pais: ['EUA','México'], data: '2026-06-21T02:00:00Z', grupo: 'A' },
  // Grupo B
  { fixtureId: 1100007, casa: 'Argentina', fora: 'Albânia', casaId: 26, foraId: 1020, pais: ['Argentina','Albânia'], data: '2026-06-12T23:00:00Z', grupo: 'B' },
  { fixtureId: 1100008, casa: 'Ucrânia', fora: 'Marrocos', casaId: 772, foraId: 40, pais: ['Ucrânia','Marrocos'], data: '2026-06-13T02:00:00Z', grupo: 'B' },
  { fixtureId: 1100009, casa: 'Argentina', fora: 'Marrocos', casaId: 26, foraId: 40, pais: ['Argentina','Marrocos'], data: '2026-06-17T00:00:00Z', grupo: 'B' },
  { fixtureId: 1100010, casa: 'Ucrânia', fora: 'Albânia', casaId: 772, foraId: 1020, pais: ['Ucrânia','Albânia'], data: '2026-06-17T23:00:00Z', grupo: 'B' },
  { fixtureId: 1100011, casa: 'Marrocos', fora: 'Albânia', casaId: 40, foraId: 1020, pais: ['Marrocos','Albânia'], data: '2026-06-21T22:00:00Z', grupo: 'B' },
  { fixtureId: 1100012, casa: 'Argentina', fora: 'Ucrânia', casaId: 26, foraId: 772, pais: ['Argentina','Ucrânia'], data: '2026-06-22T01:00:00Z', grupo: 'B' },
  // Grupo C
  { fixtureId: 1100013, casa: 'Brasil', fora: 'Chile', casaId: 6, foraId: 11, pais: ['Brasil','Chile'], data: '2026-06-13T20:00:00Z', grupo: 'C' },
  { fixtureId: 1100014, casa: 'Camarões', fora: 'Japão', casaId: 23, foraId: 30, pais: ['Camarões','Japão'], data: '2026-06-13T23:00:00Z', grupo: 'C' },
  { fixtureId: 1100015, casa: 'Brasil', fora: 'Camarões', casaId: 6, foraId: 23, pais: ['Brasil','Camarões'], data: '2026-06-17T20:00:00Z', grupo: 'C' },
  { fixtureId: 1100016, casa: 'Japão', fora: 'Chile', casaId: 30, foraId: 11, pais: ['Japão','Chile'], data: '2026-06-18T02:00:00Z', grupo: 'C' },
  { fixtureId: 1100017, casa: 'Brasil', fora: 'Japão', casaId: 6, foraId: 30, pais: ['Brasil','Japão'], data: '2026-06-22T22:00:00Z', grupo: 'C' },
  { fixtureId: 1100018, casa: 'Chile', fora: 'Camarões', casaId: 11, foraId: 23, pais: ['Chile','Camarões'], data: '2026-06-22T22:00:00Z', grupo: 'C' },
  // Grupo D
  { fixtureId: 1100019, casa: 'França', fora: 'Polónia', casaId: 2, foraId: 24, pais: ['França','Polónia'], data: '2026-06-14T20:00:00Z', grupo: 'D' },
  { fixtureId: 1100020, casa: 'Irlanda', fora: 'Angola', casaId: 25, foraId: 1184, pais: ['Irlanda','Angola'], data: '2026-06-14T23:00:00Z', grupo: 'D' },
  { fixtureId: 1100021, casa: 'França', fora: 'Irlanda', casaId: 2, foraId: 25, pais: ['França','Irlanda'], data: '2026-06-18T20:00:00Z', grupo: 'D' },
  { fixtureId: 1100022, casa: 'Angola', fora: 'Polónia', casaId: 1184, foraId: 24, pais: ['Angola','Polónia'], data: '2026-06-19T00:00:00Z', grupo: 'D' },
  { fixtureId: 1100023, casa: 'França', fora: 'Angola', casaId: 2, foraId: 1184, pais: ['França','Angola'], data: '2026-06-23T00:00:00Z', grupo: 'D' },
  { fixtureId: 1100024, casa: 'Polónia', fora: 'Irlanda', casaId: 24, foraId: 25, pais: ['Polónia','Irlanda'], data: '2026-06-23T00:00:00Z', grupo: 'D' },
  // Grupo E
  { fixtureId: 1100025, casa: 'Espanha', fora: 'Ilhas Faroé', casaId: 9, foraId: 1006, pais: ['Espanha','Ilhas Faroé'], data: '2026-06-15T00:00:00Z', grupo: 'E' },
  { fixtureId: 1100026, casa: 'Tunísia', fora: 'Bermudas', casaId: 41, foraId: 1060, pais: ['Tunísia','Bermudas'], data: '2026-06-15T02:00:00Z', grupo: 'E' },
  // Grupo F
  { fixtureId: 1100031, casa: 'Alemanha', fora: 'Equipa F2', casaId: 25, foraId: 999, pais: ['Alemanha','TBD'], data: '2026-06-15T20:00:00Z', grupo: 'F' },
  // Grupo G
  { fixtureId: 1100037, casa: 'Portugal', fora: 'Rep. Checa', casaId: 27, foraId: 770, pais: ['Portugal','Rep. Checa'], data: '2026-06-16T00:00:00Z', grupo: 'G' },
  // Grupo H
  { fixtureId: 1100043, casa: 'Inglaterra', fora: 'Sérvia', casaId: 10, foraId: 760, pais: ['Inglaterra','Sérvia'], data: '2026-06-16T20:00:00Z', grupo: 'H' },
]

async function main() {
  console.log('🌱 Seeding jogos...')
  let count = 0

  for (const j of JOGOS) {
    await prisma.jogo.upsert({
      where: { fixtureId: j.fixtureId },
      update: {},
      create: {
        fixtureId: j.fixtureId,
        equipaCasa: j.casa,
        equipaFora: j.fora,
        equipaCasaId: j.casaId,
        equipaForaId: j.foraId,
        paisCasa: j.pais[0],
        paisFora: j.pais[1],
        data: new Date(j.data),
        fase: 'GRUPOS',
        grupo: j.grupo,
      },
    })
    count++
  }

  console.log(`✅ ${count} jogos inseridos`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
