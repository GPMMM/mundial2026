const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world'

// ESPN English name → Portuguese name used in our DB
export const ESPN_TO_PT: Record<string, string> = {
  'Mexico': 'México',
  'South Africa': 'África do Sul',
  'Czechia': 'Rep. Checa',
  'Czech Republic': 'Rep. Checa',
  'South Korea': 'Coreia do Sul',
  'Korea Republic': 'Coreia do Sul',
  'Canada': 'Canadá',
  'Bosnia and Herzegovina': 'Bósnia-Herzegovina',
  'Qatar': 'Catar',
  'Switzerland': 'Suíça',
  'Brazil': 'Brasil',
  'Morocco': 'Marrocos',
  'Haiti': 'Haiti',
  'Scotland': 'Escócia',
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'Paraguay': 'Paraguai',
  'Australia': 'Austrália',
  'Turkey': 'Turquia',
  'Germany': 'Alemanha',
  'Curaçao': 'Curaçao',
  'Netherlands': 'Países Baixos',
  'Japan': 'Japão',
  'Argentina': 'Argentina',
  'Spain': 'Espanha',
  'France': 'França',
  'England': 'Inglaterra',
  'Portugal': 'Portugal',
  'Uruguay': 'Uruguai',
  'Colombia': 'Colômbia',
  'Belgium': 'Bélgica',
  'Croatia': 'Croácia',
  'Saudi Arabia': 'Arábia Saudita',
  'Algeria': 'Argélia',
  'Tunisia': 'Tunísia',
  'Senegal': 'Senegal',
  'Ghana': 'Gana',
  "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim',
  'Egypt': 'Egito',
  'Ecuador': 'Equador',
  'Panama': 'Panamá',
  'Norway': 'Noruega',
  'Sweden': 'Suécia',
  'Austria': 'Áustria',
  'Iran': 'Irão',
  'Iraq': 'Iraque',
  'Jordan': 'Jordânia',
  'New Zealand': 'Nova Zelândia',
  'Uzbekistan': 'Usbequistão',
  'DR Congo': 'Congo RD',
  'Congo DR': 'Congo RD',
  'Democratic Republic of Congo': 'Congo RD',
  'Cape Verde': 'Cabo Verde',
}

export function toPT(espnName: string): string {
  return ESPN_TO_PT[espnName] ?? espnName
}

export interface EspnCompetitor {
  homeAway: 'home' | 'away'
  team: { id: string; displayName: string }
  score: string
}

export interface EspnEvent {
  id: string
  date: string
  competitions: {
    status: { type: { name: string; completed: boolean } }
    competitors: EspnCompetitor[]
  }[]
}

export interface EspnKeyEvent {
  type: { type: string }
  scoringPlay: boolean
  team?: { displayName: string }
  participants?: { athlete: { displayName: string } }[]
}

export async function getEspnFixturesByDate(yyyymmdd: string): Promise<EspnEvent[]> {
  const res = await fetch(`${BASE}/scoreboard?dates=${yyyymmdd}`, {
    next: { revalidate: 0 },
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`ESPN scoreboard error: ${res.status}`)
  const data = await res.json()
  return data.events ?? []
}

export async function getEspnScorers(eventId: string): Promise<EspnKeyEvent[]> {
  const res = await fetch(`${BASE}/summary?event=${eventId}`, {
    next: { revalidate: 0 },
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.keyEvents ?? []
}

export function formatDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/** Returns YYYYMMDD strings from startDate to today (UTC), inclusive */
export function dateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const cur = new Date(startDate)
  cur.setUTCHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setUTCHours(0, 0, 0, 0)
  while (cur <= end) {
    dates.push(formatDate(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}
