/**
 * Fetches all 48 WC 2026 teams from API-Football and prints their IDs.
 * Run with: npx tsx prisma/check-team-ids.ts
 * Requires: API_FOOTBALL_KEY set in .env
 */
import 'dotenv/config'

async function main() {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) {
    console.error('❌ API_FOOTBALL_KEY not set')
    process.exit(1)
  }

  const res = await fetch('https://v3.football.api-sports.io/teams?league=1&season=2026', {
    headers: { 'x-apisports-key': key },
  })

  if (!res.ok) {
    console.error(`❌ API error: ${res.status}`)
    process.exit(1)
  }

  const data = await res.json()
  const teams: { team: { id: number; name: string; code: string } }[] = data.response ?? []

  console.log(`\n✅ ${teams.length} teams found\n`)
  console.log('Copy the IDs below into seed-jogos.ts:\n')

  teams
    .sort((a, b) => a.team.name.localeCompare(b.team.name))
    .forEach(({ team }) => {
      console.log(`  ${team.id.toString().padStart(5)}  ${team.code ?? '   '}  ${team.name}`)
    })

  // Highlight the known problem teams
  const problems = ['France', 'United States', 'Germany', 'Australia', 'Belgium', 'Netherlands', 'Ecuador', 'Senegal']
  console.log('\n--- Duplicated teams in seed (verify these) ---')
  teams
    .filter(({ team }) => problems.some(p => team.name.toLowerCase().includes(p.toLowerCase())))
    .forEach(({ team }) => {
      console.log(`  ${team.id.toString().padStart(5)}  ${team.code ?? '   '}  ${team.name}`)
    })
}

main().catch(console.error)
