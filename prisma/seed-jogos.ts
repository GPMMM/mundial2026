import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// -------------------------------------------------------------------
// FIFA World Cup 2026 — complete fixture list
// Source: official FIFA draw (Dec 2024) + Sky Sports schedule
// All times UTC. UK BST (UTC+1) times converted.
//
// ⚠️  TEAM IDs — these are API-Football national team IDs.
// To verify/fix them, run: npx tsx prisma/check-team-ids.ts
// Known duplicates that must be corrected:
//   casaId:2  → França (correct) vs Estados Unidos (WRONG — needs real USA id)
//   casaId:25 → Alemanha (correct) vs Austrália (WRONG — needs real AUS id)
//   casaId:1  → Bélgica (correct) vs Países Baixos (WRONG — needs real NED id)
//   foraId:14 → Equador (correct) vs Senegal (WRONG — needs real SEN id)
// -------------------------------------------------------------------

const GRUPOS: Array<{
  fixtureId: number
  casa: string; casaId: number | null
  fora: string; foraId: number | null
  data: string
  grupo: string
}> = [
  // ── Grupo A: México · África do Sul · Coreia do Sul · Rep. Checa ──
  { fixtureId: 1100001, casa: 'México',         casaId: 16,   fora: 'África do Sul', foraId: 815,  data: '2026-06-11T19:00:00Z', grupo: 'A' },
  { fixtureId: 1100002, casa: 'Coreia do Sul',  casaId: 30,   fora: 'Rep. Checa',    foraId: 770,  data: '2026-06-12T02:00:00Z', grupo: 'A' },
  { fixtureId: 1100003, casa: 'Rep. Checa',     casaId: 770,  fora: 'África do Sul', foraId: 815,  data: '2026-06-18T16:00:00Z', grupo: 'A' },
  { fixtureId: 1100004, casa: 'México',         casaId: 16,   fora: 'Coreia do Sul', foraId: 30,   data: '2026-06-19T01:00:00Z', grupo: 'A' },
  { fixtureId: 1100005, casa: 'África do Sul',  casaId: 815,  fora: 'Coreia do Sul', foraId: 30,   data: '2026-06-25T01:00:00Z', grupo: 'A' },
  { fixtureId: 1100006, casa: 'Rep. Checa',     casaId: 770,  fora: 'México',        foraId: 16,   data: '2026-06-25T01:00:00Z', grupo: 'A' },

  // ── Grupo B: Canadá · Bósnia-Herzegovina · Catar · Suíça ──
  { fixtureId: 1100007, casa: 'Canadá',              casaId: 101,  fora: 'Bósnia-Herzegovina', foraId: 756,  data: '2026-06-12T19:00:00Z', grupo: 'B' },
  { fixtureId: 1100008, casa: 'Catar',               casaId: 167,  fora: 'Suíça',              foraId: 15,   data: '2026-06-13T19:00:00Z', grupo: 'B' },
  { fixtureId: 1100009, casa: 'Suíça',               casaId: 15,   fora: 'Bósnia-Herzegovina', foraId: 756,  data: '2026-06-18T19:00:00Z', grupo: 'B' },
  { fixtureId: 1100010, casa: 'Canadá',              casaId: 101,  fora: 'Catar',              foraId: 167,  data: '2026-06-18T22:00:00Z', grupo: 'B' },
  { fixtureId: 1100011, casa: 'Suíça',               casaId: 15,   fora: 'Canadá',             foraId: 101,  data: '2026-06-24T19:00:00Z', grupo: 'B' },
  { fixtureId: 1100012, casa: 'Bósnia-Herzegovina',  casaId: 756,  fora: 'Catar',              foraId: 167,  data: '2026-06-24T19:00:00Z', grupo: 'B' },

  // ── Grupo C: Brasil · Marrocos · Haiti · Escócia ──
  { fixtureId: 1100013, casa: 'Brasil',    casaId: 6,    fora: 'Marrocos',  foraId: 40,   data: '2026-06-13T22:00:00Z', grupo: 'C' },
  { fixtureId: 1100014, casa: 'Haiti',     casaId: 503,  fora: 'Escócia',   foraId: 1108, data: '2026-06-14T01:00:00Z', grupo: 'C' },
  { fixtureId: 1100015, casa: 'Escócia',   casaId: 1108, fora: 'Marrocos',  foraId: 40,   data: '2026-06-19T22:00:00Z', grupo: 'C' },
  { fixtureId: 1100016, casa: 'Brasil',    casaId: 6,    fora: 'Haiti',     foraId: 503,  data: '2026-06-20T00:30:00Z', grupo: 'C' },
  { fixtureId: 1100017, casa: 'Marrocos',  casaId: 40,   fora: 'Haiti',     foraId: 503,  data: '2026-06-24T22:00:00Z', grupo: 'C' },
  { fixtureId: 1100018, casa: 'Escócia',   casaId: 1108, fora: 'Brasil',    foraId: 6,    data: '2026-06-24T22:00:00Z', grupo: 'C' },

  // ── Grupo D: Estados Unidos · Paraguai · Austrália · Turquia ──
  { fixtureId: 1100019, casa: 'Estados Unidos', casaId: 2,    fora: 'Paraguai',  foraId: 7,    data: '2026-06-13T01:00:00Z', grupo: 'D' },
  { fixtureId: 1100020, casa: 'Austrália',      casaId: 25,   fora: 'Turquia',   foraId: 732,  data: '2026-06-14T04:00:00Z', grupo: 'D' },
  { fixtureId: 1100021, casa: 'Estados Unidos', casaId: 2,    fora: 'Austrália', foraId: 25,   data: '2026-06-19T19:00:00Z', grupo: 'D' },
  { fixtureId: 1100022, casa: 'Turquia',        casaId: 732,  fora: 'Paraguai',  foraId: 7,    data: '2026-06-20T03:00:00Z', grupo: 'D' },
  { fixtureId: 1100023, casa: 'Turquia',        casaId: 732,  fora: 'Estados Unidos', foraId: 2, data: '2026-06-26T02:00:00Z', grupo: 'D' },
  { fixtureId: 1100024, casa: 'Paraguai',       casaId: 7,    fora: 'Austrália', foraId: 25,   data: '2026-06-26T02:00:00Z', grupo: 'D' },

  // ── Grupo E: Alemanha · Curaçao · Costa do Marfim · Equador ──
  { fixtureId: 1100025, casa: 'Alemanha',        casaId: 25,   fora: 'Curaçao',        foraId: 615,  data: '2026-06-14T17:00:00Z', grupo: 'E' },
  { fixtureId: 1100026, casa: 'Costa do Marfim', casaId: 400,  fora: 'Equador',        foraId: 14,   data: '2026-06-14T23:00:00Z', grupo: 'E' },
  { fixtureId: 1100027, casa: 'Alemanha',        casaId: 25,   fora: 'Costa do Marfim',foraId: 400,  data: '2026-06-20T20:00:00Z', grupo: 'E' },
  { fixtureId: 1100028, casa: 'Equador',         casaId: 14,   fora: 'Curaçao',        foraId: 615,  data: '2026-06-21T00:00:00Z', grupo: 'E' },
  { fixtureId: 1100029, casa: 'Curaçao',         casaId: 615,  fora: 'Costa do Marfim',foraId: 400,  data: '2026-06-25T20:00:00Z', grupo: 'E' },
  { fixtureId: 1100030, casa: 'Equador',         casaId: 14,   fora: 'Alemanha',       foraId: 25,   data: '2026-06-25T20:00:00Z', grupo: 'E' },

  // ── Grupo F: Países Baixos · Japão · Suécia · Tunísia ──
  { fixtureId: 1100031, casa: 'Países Baixos', casaId: 1,    fora: 'Japão',   foraId: 22,   data: '2026-06-14T20:00:00Z', grupo: 'F' },
  { fixtureId: 1100032, casa: 'Suécia',        casaId: 11,   fora: 'Tunísia', foraId: 41,   data: '2026-06-15T02:00:00Z', grupo: 'F' },
  { fixtureId: 1100033, casa: 'Países Baixos', casaId: 1,    fora: 'Suécia',  foraId: 11,   data: '2026-06-20T17:00:00Z', grupo: 'F' },
  { fixtureId: 1100034, casa: 'Tunísia',       casaId: 41,   fora: 'Japão',   foraId: 22,   data: '2026-06-21T04:00:00Z', grupo: 'F' },
  { fixtureId: 1100035, casa: 'Tunísia',       casaId: 41,   fora: 'Países Baixos', foraId: 1, data: '2026-06-25T23:00:00Z', grupo: 'F' },
  { fixtureId: 1100036, casa: 'Japão',         casaId: 22,   fora: 'Suécia',  foraId: 11,   data: '2026-06-25T23:00:00Z', grupo: 'F' },

  // ── Grupo G: Bélgica · Egito · Irão · Nova Zelândia ──
  { fixtureId: 1100037, casa: 'Bélgica',       casaId: 1,    fora: 'Egito',        foraId: 29,   data: '2026-06-15T19:00:00Z', grupo: 'G' },
  { fixtureId: 1100038, casa: 'Irão',          casaId: 289,  fora: 'Nova Zelândia',foraId: 35,   data: '2026-06-16T01:00:00Z', grupo: 'G' },
  { fixtureId: 1100039, casa: 'Bélgica',       casaId: 1,    fora: 'Irão',         foraId: 289,  data: '2026-06-21T19:00:00Z', grupo: 'G' },
  { fixtureId: 1100040, casa: 'Nova Zelândia', casaId: 35,   fora: 'Egito',        foraId: 29,   data: '2026-06-22T01:00:00Z', grupo: 'G' },
  { fixtureId: 1100041, casa: 'Nova Zelândia', casaId: 35,   fora: 'Bélgica',      foraId: 1,    data: '2026-06-27T03:00:00Z', grupo: 'G' },
  { fixtureId: 1100042, casa: 'Egito',         casaId: 29,   fora: 'Irão',         foraId: 289,  data: '2026-06-27T03:00:00Z', grupo: 'G' },

  // ── Grupo H: Espanha · Cabo Verde · Arábia Saudita · Uruguai ──
  { fixtureId: 1100043, casa: 'Espanha',       casaId: 9,    fora: 'Cabo Verde',    foraId: 616,  data: '2026-06-15T16:00:00Z', grupo: 'H' },
  { fixtureId: 1100044, casa: 'Arábia Saudita',casaId: 157,  fora: 'Uruguai',       foraId: 4,    data: '2026-06-15T22:00:00Z', grupo: 'H' },
  { fixtureId: 1100045, casa: 'Espanha',       casaId: 9,    fora: 'Arábia Saudita',foraId: 157,  data: '2026-06-21T16:00:00Z', grupo: 'H' },
  { fixtureId: 1100046, casa: 'Uruguai',       casaId: 4,    fora: 'Cabo Verde',    foraId: 616,  data: '2026-06-21T22:00:00Z', grupo: 'H' },
  { fixtureId: 1100047, casa: 'Cabo Verde',    casaId: 616,  fora: 'Arábia Saudita',foraId: 157,  data: '2026-06-27T00:00:00Z', grupo: 'H' },
  { fixtureId: 1100048, casa: 'Uruguai',       casaId: 4,    fora: 'Espanha',       foraId: 9,    data: '2026-06-27T00:00:00Z', grupo: 'H' },

  // ── Grupo I: França · Senegal · Iraque · Noruega ──
  { fixtureId: 1100049, casa: 'França',   casaId: 2,    fora: 'Senegal', foraId: 14,   data: '2026-06-16T19:00:00Z', grupo: 'I' },
  { fixtureId: 1100050, casa: 'Iraque',   casaId: 390,  fora: 'Noruega', foraId: 20,   data: '2026-06-16T22:00:00Z', grupo: 'I' },
  { fixtureId: 1100051, casa: 'França',   casaId: 2,    fora: 'Iraque',  foraId: 390,  data: '2026-06-22T21:00:00Z', grupo: 'I' },
  { fixtureId: 1100052, casa: 'Noruega',  casaId: 20,   fora: 'Senegal', foraId: 14,   data: '2026-06-23T00:00:00Z', grupo: 'I' },
  { fixtureId: 1100053, casa: 'Noruega',  casaId: 20,   fora: 'França',  foraId: 2,    data: '2026-06-26T19:00:00Z', grupo: 'I' },
  { fixtureId: 1100054, casa: 'Senegal',  casaId: 14,   fora: 'Iraque',  foraId: 390,  data: '2026-06-26T19:00:00Z', grupo: 'I' },

  // ── Grupo J: Argentina · Argélia · Áustria · Jordânia ──
  { fixtureId: 1100055, casa: 'Argentina', casaId: 26,   fora: 'Argélia',  foraId: 57,   data: '2026-06-17T01:00:00Z', grupo: 'J' },
  { fixtureId: 1100056, casa: 'Áustria',   casaId: 45,   fora: 'Jordânia', foraId: 520,  data: '2026-06-17T04:00:00Z', grupo: 'J' },
  { fixtureId: 1100057, casa: 'Argentina', casaId: 26,   fora: 'Áustria',  foraId: 45,   data: '2026-06-22T17:00:00Z', grupo: 'J' },
  { fixtureId: 1100058, casa: 'Jordânia',  casaId: 520,  fora: 'Argélia',  foraId: 57,   data: '2026-06-23T03:00:00Z', grupo: 'J' },
  { fixtureId: 1100059, casa: 'Argélia',   casaId: 57,   fora: 'Áustria',  foraId: 45,   data: '2026-06-28T02:00:00Z', grupo: 'J' },
  { fixtureId: 1100060, casa: 'Jordânia',  casaId: 520,  fora: 'Argentina',foraId: 26,   data: '2026-06-28T02:00:00Z', grupo: 'J' },

  // ── Grupo K: Portugal · Congo RD · Usbequistão · Colômbia ──
  { fixtureId: 1100061, casa: 'Portugal',    casaId: 27,   fora: 'Congo RD',    foraId: 828,  data: '2026-06-17T17:00:00Z', grupo: 'K' },
  { fixtureId: 1100062, casa: 'Usbequistão', casaId: 1408, fora: 'Colômbia',   foraId: 12,   data: '2026-06-18T02:00:00Z', grupo: 'K' },
  { fixtureId: 1100063, casa: 'Portugal',    casaId: 27,   fora: 'Usbequistão',foraId: 1408, data: '2026-06-23T17:00:00Z', grupo: 'K' },
  { fixtureId: 1100064, casa: 'Colômbia',   casaId: 12,   fora: 'Congo RD',    foraId: 828,  data: '2026-06-24T02:00:00Z', grupo: 'K' },
  { fixtureId: 1100065, casa: 'Colômbia',   casaId: 12,   fora: 'Portugal',    foraId: 27,   data: '2026-06-27T23:30:00Z', grupo: 'K' },
  { fixtureId: 1100066, casa: 'Congo RD',   casaId: 828,  fora: 'Usbequistão', foraId: 1408, data: '2026-06-27T23:30:00Z', grupo: 'K' },

  // ── Grupo L: Inglaterra · Croácia · Gana · Panamá ──
  { fixtureId: 1100067, casa: 'Inglaterra', casaId: 10,   fora: 'Croácia', foraId: 3,    data: '2026-06-17T20:00:00Z', grupo: 'L' },
  { fixtureId: 1100068, casa: 'Gana',       casaId: 18,   fora: 'Panamá',  foraId: 95,   data: '2026-06-17T23:00:00Z', grupo: 'L' },
  { fixtureId: 1100069, casa: 'Inglaterra', casaId: 10,   fora: 'Gana',    foraId: 18,   data: '2026-06-23T20:00:00Z', grupo: 'L' },
  { fixtureId: 1100070, casa: 'Panamá',     casaId: 95,   fora: 'Croácia', foraId: 3,    data: '2026-06-23T23:00:00Z', grupo: 'L' },
  { fixtureId: 1100071, casa: 'Panamá',     casaId: 95,   fora: 'Inglaterra', foraId: 10, data: '2026-06-27T21:00:00Z', grupo: 'L' },
  { fixtureId: 1100072, casa: 'Croácia',    casaId: 3,    fora: 'Gana',    foraId: 18,   data: '2026-06-27T21:00:00Z', grupo: 'L' },
]

// Round of 32 — bracket positions become known after group stage
// Labels use FIFA draw bracket notation (1A = 1st place Group A, etc.)
const TRINTA_E_DOIS: Array<{
  fixtureId: number
  casa: string; fora: string
  data: string
  matchNum: number
}> = [
  { fixtureId: 1100073, casa: '2º A',           fora: '2º B',           data: '2026-07-03T19:00:00Z', matchNum: 73 },
  { fixtureId: 1100074, casa: '1º E',           fora: '3º A/B/C/D/F',  data: '2026-07-03T22:00:00Z', matchNum: 74 },
  { fixtureId: 1100075, casa: '1º F',           fora: '2º C',           data: '2026-07-04T19:00:00Z', matchNum: 75 },
  { fixtureId: 1100076, casa: '1º C',           fora: '2º F',           data: '2026-07-04T22:00:00Z', matchNum: 76 },
  { fixtureId: 1100077, casa: '1º I',           fora: '3º C/D/F/G/H',  data: '2026-07-04T01:00:00Z', matchNum: 77 },
  { fixtureId: 1100078, casa: '2º E',           fora: '2º I',           data: '2026-07-04T04:00:00Z', matchNum: 78 },
  { fixtureId: 1100079, casa: '1º A',           fora: '3º C/E/F/H/I',  data: '2026-07-05T19:00:00Z', matchNum: 79 },
  { fixtureId: 1100080, casa: '1º L',           fora: '3º E/H/I/J/K',  data: '2026-07-05T22:00:00Z', matchNum: 80 },
  { fixtureId: 1100081, casa: '1º D',           fora: '3º B/E/F/I/J',  data: '2026-07-05T01:00:00Z', matchNum: 81 },
  { fixtureId: 1100082, casa: '1º G',           fora: '3º A/E/H/I/J',  data: '2026-07-05T04:00:00Z', matchNum: 82 },
  { fixtureId: 1100083, casa: '2º K',           fora: '2º L',           data: '2026-07-06T19:00:00Z', matchNum: 83 },
  { fixtureId: 1100084, casa: '1º H',           fora: '2º J',           data: '2026-07-06T22:00:00Z', matchNum: 84 },
  { fixtureId: 1100085, casa: '1º B',           fora: '3º E/F/G/I/J',  data: '2026-07-06T01:00:00Z', matchNum: 85 },
  { fixtureId: 1100086, casa: '1º J',           fora: '2º H',           data: '2026-07-06T04:00:00Z', matchNum: 86 },
  { fixtureId: 1100087, casa: '1º K',           fora: '3º D/E/I/J/L',  data: '2026-07-07T19:00:00Z', matchNum: 87 },
  { fixtureId: 1100088, casa: '2º D',           fora: '2º G',           data: '2026-07-07T22:00:00Z', matchNum: 88 },
]

// Round of 16
const OITAVOS: Array<{ fixtureId: number; casa: string; fora: string; data: string; matchNum: number }> = [
  { fixtureId: 1100089, casa: 'V74', fora: 'V77', data: '2026-07-09T19:00:00Z', matchNum: 89 },
  { fixtureId: 1100090, casa: 'V73', fora: 'V75', data: '2026-07-09T22:00:00Z', matchNum: 90 },
  { fixtureId: 1100091, casa: 'V76', fora: 'V78', data: '2026-07-10T19:00:00Z', matchNum: 91 },
  { fixtureId: 1100092, casa: 'V79', fora: 'V80', data: '2026-07-10T22:00:00Z', matchNum: 92 },
  { fixtureId: 1100093, casa: 'V83', fora: 'V84', data: '2026-07-11T19:00:00Z', matchNum: 93 },
  { fixtureId: 1100094, casa: 'V81', fora: 'V82', data: '2026-07-11T22:00:00Z', matchNum: 94 },
  { fixtureId: 1100095, casa: 'V86', fora: 'V88', data: '2026-07-12T19:00:00Z', matchNum: 95 },
  { fixtureId: 1100096, casa: 'V85', fora: 'V87', data: '2026-07-12T22:00:00Z', matchNum: 96 },
]

// Quarter-finals
const QUARTOS: Array<{ fixtureId: number; casa: string; fora: string; data: string; matchNum: number }> = [
  { fixtureId: 1100097, casa: 'V89', fora: 'V90', data: '2026-07-14T19:00:00Z', matchNum: 97 },
  { fixtureId: 1100098, casa: 'V93', fora: 'V94', data: '2026-07-14T22:00:00Z', matchNum: 98 },
  { fixtureId: 1100099, casa: 'V91', fora: 'V92', data: '2026-07-15T19:00:00Z', matchNum: 99 },
  { fixtureId: 1100100, casa: 'V95', fora: 'V96', data: '2026-07-15T22:00:00Z', matchNum: 100 },
]

// Semi-finals
const MEIAS: Array<{ fixtureId: number; casa: string; fora: string; data: string; matchNum: number }> = [
  { fixtureId: 1100101, casa: 'V97', fora: 'V98',  data: '2026-07-18T19:00:00Z', matchNum: 101 },
  { fixtureId: 1100102, casa: 'V99', fora: 'V100', data: '2026-07-18T22:00:00Z', matchNum: 102 },
]

// Final
const FINAL_JOGO = { fixtureId: 1100104, casa: 'V101', fora: 'V102', data: '2026-07-19T19:00:00Z', matchNum: 104 }

// -------------------------------------------------------------------

async function main() {
  console.log('🧹 Clearing existing fixtures and predictions...')
  await prisma.previsao.deleteMany()
  await prisma.jogo.deleteMany()
  console.log('✅ Cleared')

  // Group stage
  console.log('⚽ Inserting group stage (72 matches)...')
  for (const j of GRUPOS) {
    await prisma.jogo.create({
      data: {
        fixtureId: j.fixtureId,
        equipaCasa: j.casa,
        equipaFora: j.fora,
        equipaCasaId: j.casaId,
        equipaForaId: j.foraId,
        paisCasa: j.casa,
        paisFora: j.fora,
        data: new Date(j.data),
        fase: 'GRUPOS',
        grupo: j.grupo,
      },
    })
  }

  // Round of 32
  console.log('🔵 Inserting Round of 32 (16 matches)...')
  for (const j of TRINTA_E_DOIS) {
    await prisma.jogo.create({
      data: {
        fixtureId: j.fixtureId,
        equipaCasa: j.casa,
        equipaFora: j.fora,
        equipaCasaId: null,
        equipaForaId: null,
        paisCasa: j.casa,
        paisFora: j.fora,
        data: new Date(j.data),
        fase: 'TRINTA_E_DOIS',
      },
    })
  }

  // Round of 16
  console.log('🟡 Inserting Round of 16 (8 matches)...')
  for (const j of OITAVOS) {
    await prisma.jogo.create({
      data: {
        fixtureId: j.fixtureId,
        equipaCasa: j.casa,
        equipaFora: j.fora,
        equipaCasaId: null,
        equipaForaId: null,
        paisCasa: j.casa,
        paisFora: j.fora,
        data: new Date(j.data),
        fase: 'OITAVOS',
      },
    })
  }

  // Quarter-finals
  console.log('🟠 Inserting Quarter-finals (4 matches)...')
  for (const j of QUARTOS) {
    await prisma.jogo.create({
      data: {
        fixtureId: j.fixtureId,
        equipaCasa: j.casa,
        equipaFora: j.fora,
        equipaCasaId: null,
        equipaForaId: null,
        paisCasa: j.casa,
        paisFora: j.fora,
        data: new Date(j.data),
        fase: 'QUARTOS',
      },
    })
  }

  // Semi-finals
  console.log('🔴 Inserting Semi-finals (2 matches)...')
  for (const j of MEIAS) {
    await prisma.jogo.create({
      data: {
        fixtureId: j.fixtureId,
        equipaCasa: j.casa,
        equipaFora: j.fora,
        equipaCasaId: null,
        equipaForaId: null,
        paisCasa: j.casa,
        paisFora: j.fora,
        data: new Date(j.data),
        fase: 'MEIAS',
      },
    })
  }

  // Final
  console.log('🏆 Inserting Final...')
  await prisma.jogo.create({
    data: {
      fixtureId: FINAL_JOGO.fixtureId,
      equipaCasa: FINAL_JOGO.casa,
      equipaFora: FINAL_JOGO.fora,
      equipaCasaId: null,
      equipaForaId: null,
      paisCasa: FINAL_JOGO.casa,
      paisFora: FINAL_JOGO.fora,
      data: new Date(FINAL_JOGO.data),
      fase: 'FINAL',
    },
  })

  const total = await prisma.jogo.count()
  console.log(`\n✅ Done — ${total} matches in the database`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
