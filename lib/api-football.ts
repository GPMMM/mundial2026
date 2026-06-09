const BASE_URL = 'https://v3.football.api-sports.io'
const LEAGUE_ID = 1
const SEASON = 2026

async function apiFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`API-Football error: ${res.status}`)
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(`API-Football returned non-JSON response (${res.status})`)
  }
  return res.json()
}

export async function getFixtures() {
  return apiFetch(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`)
}

export async function getFixture(id: number) {
  return apiFetch(`/fixtures?id=${id}`)
}

export async function getFixtureEvents(fixtureId: number) {
  return apiFetch(`/fixtures/events?fixture=${fixtureId}`)
}

export async function getFixtureLineups(fixtureId: number) {
  return apiFetch(`/fixtures/lineups?fixture=${fixtureId}`)
}

export async function getSquad(teamId: number) {
  const res = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
    next: { revalidate: 259200 }, // cache 3 days — squads don't change during tournament
  })
  if (!res.ok) throw new Error(`API-Football error: ${res.status}`)
  return res.json()
}

export function parseFase(round: string): 'GRUPOS' | 'TRINTA_E_DOIS' | 'OITAVOS' | 'QUARTOS' | 'MEIAS' | 'FINAL' {
  const r = round.toLowerCase()
  if (r.includes('group')) return 'GRUPOS'
  if (r.includes('round of 32') || r.includes('1/16')) return 'TRINTA_E_DOIS'
  if (r.includes('round of 16') || r.includes('1/8') || r.includes('round of sixteen')) return 'OITAVOS'
  if (r.includes('quarter')) return 'QUARTOS'
  if (r.includes('semi')) return 'MEIAS'
  if (r.includes('final')) return 'FINAL'
  return 'GRUPOS'
}

export function parseGrupo(round: string): string | null {
  const match = round.match(/group\s+([a-l])/i)
  return match ? match[1].toUpperCase() : null
}


export interface ApiFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; long: string }
  }
  league: {
    round: string
    group?: string
  }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
}

export interface ApiEvent {
  type: string
  detail: string
  player: { name: string } | null
  team: { id: number; name: string } | null
  teams?: { home?: { id: number }; away?: { id: number } }
}

export interface ApiLineupPlayer {
  player: { id: number; name: string; number: number; pos: string }
}

export interface ApiLineup {
  team: { id: number; name: string }
  startXI: ApiLineupPlayer[]
  substitutes: ApiLineupPlayer[]
}

export interface ApiSquadPlayer {
  id: number
  name: string
  age: number
  number: number | null
  position: string
  photo: string
}

export interface ApiSquad {
  team: { id: number; name: string; logo: string }
  players: ApiSquadPlayer[]
}
