import { fetchFloWrestler, resolveFloIdFromTwId } from '../server/flowrestling.js'
import { searchWrestlers } from '../server/trackwrestling.js'

async function inspectTw(twId: string, label?: string) {
  const floId = await resolveFloIdFromTwId(twId)
  if (!floId) {
    console.log(label ?? twId, 'no flo id')
    return
  }

  const flo = await fetchFloWrestler(floId)
  if (!flo) return

  const statLevels = flo.stats?.perLevelStats?.map((s) => s.level) ?? []
  const boutLevels = [
    ...new Set(
      flo.results.flatMap((r) => (r.boutResults ?? []).map((b) => b.level)).filter(Boolean),
    ),
  ]

  console.log('\n===', label ?? twId, 'flo', floId, '===')
  console.log('stat levels:', statLevels)
  console.log('bout levels:', boutLevels)
  console.log(
    'perLevelStats:',
    JSON.stringify(
      flo.stats?.perLevelStats?.map((s) => ({
        level: s.level,
        seasons: s.perSeasonStats?.map((ps) => ps.season),
      })),
      null,
      2,
    ),
  )
}

async function findLevels(firstName: string, lastName: string) {
  const results = await searchWrestlers(firstName, lastName)
  for (const result of results.slice(0, 8)) {
    await inspectTw(
      result.twId,
      `${result.firstName} ${result.lastName} (${result.hometown}, ${result.state})`,
    )
  }
}

const mode = process.argv[2]
if (mode === 'search') {
  await findLevels(process.argv[3] ?? '', process.argv[4] ?? '')
} else {
  for (const twId of process.argv.slice(2)) {
    await inspectTw(twId)
  }
}
