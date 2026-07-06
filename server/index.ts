import cors from 'cors'
import express from 'express'
import {
  fetchFloAthlete,
  fetchFloWrestler,
  resolveFloIdFromTwId,
  type FloWrestler,
} from './flowrestling.js'
import {
  floSignalsFromAthlete,
  profilesLikelyMatch,
  twSignalsFromScraped,
  twSignalsFromSearch,
} from './profile-link.js'
import { parseSearchQuery } from './search-query.js'
import { fetchWrestler, searchWrestlers, searchWrestlersByHometown } from './trackwrestling.js'
import { isFloId, isTwId } from './wrestler-id.js'
import { mergeWrestlerData } from './wrestler-data.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  'https://ryazlee.github.io',
])

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

async function resolveTwIdFromFlo(flo: FloWrestler): Promise<string | null> {
  const { athlete } = flo
  const floSignals = floSignalsFromAthlete(athlete, flo)
  const results = await searchWrestlers(athlete.firstName, athlete.lastName)

  for (const result of results) {
    const twSignals = twSignalsFromSearch(result)
    if (!profilesLikelyMatch(twSignals, floSignals)) continue

    const resolvedFloId = await resolveFloIdFromTwId(result.twId).catch(() => null)
    if (resolvedFloId === flo.floId) return result.twId
  }

  return null
}

async function handleFloWrestler(floId: string) {
  const flo = await fetchFloWrestler(floId)
  if (!flo) {
    throw new Error('Wrestler not found on FloWrestling')
  }

  const twId = await resolveTwIdFromFlo(flo).catch(() => null)
  const tw = twId ? await fetchWrestler(twId).catch(() => null) : null

  if (tw) {
    const twSignals = twSignalsFromScraped(tw)
    const floSignals = floSignalsFromAthlete(flo.athlete, flo)
    if (!profilesLikelyMatch(twSignals, floSignals)) {
      return mergeWrestlerData(null, flo)
    }
  }

  return mergeWrestlerData(tw, flo)
}

async function handleTwWrestler(twId: string) {
  const tw = await fetchWrestler(twId)
  const floId = await resolveFloIdFromTwId(twId).catch(() => null)

  let flo = null
  if (floId) {
    const candidate = await fetchFloWrestler(floId).catch(() => null)
    if (candidate) {
      const twSignals = twSignalsFromScraped(tw)
      const floSignals = floSignalsFromAthlete(candidate.athlete, candidate)
      if (profilesLikelyMatch(twSignals, floSignals)) {
        flo = candidate
      } else {
        console.warn(
          `Rejected Flo link for TW ${twId} -> Flo ${floId} (${tw.name} vs ${candidate.athlete.firstName} ${candidate.athlete.lastName})`,
        )
      }
    }
  }

  return mergeWrestlerData(tw, flo)
}

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const parsed = q
    ? parseSearchQuery(q)
    : {
        firstName: String(req.query.firstName ?? '').trim(),
        lastName: String(req.query.lastName ?? '').trim(),
      }

  const { firstName, lastName } = parsed

  if (!lastName) {
    res.status(400).json({ error: 'Search query is required' })
    return
  }

  try {
    const [nameResults, hometownResults] = await Promise.all([
      searchWrestlers(firstName, lastName),
      searchWrestlersByHometown(q),
    ])

    const nameIds = new Set(nameResults.map((result) => result.twId))
    const merged = [
      ...nameResults.map((result) => ({ ...result, matchType: 'name' as const })),
      ...hometownResults
        .filter((result) => !nameIds.has(result.twId))
        .map((result) => ({ ...result, matchType: 'city' as const })),
    ].slice(0, 50)

    const enriched = await Promise.all(
      merged.map(async (result) => {
        const floId = await resolveFloIdFromTwId(result.twId).catch(() => null)
        if (!floId) {
          return { ...result, id: result.twId }
        }

        const athlete = await fetchFloAthlete(floId).catch(() => null)
        if (!athlete) {
          return { ...result, id: result.twId }
        }

        const twSignals = twSignalsFromSearch(result)
        const floSignals = floSignalsFromAthlete(athlete)
        if (!profilesLikelyMatch(twSignals, floSignals)) {
          return { ...result, id: result.twId }
        }

        return { ...result, floId, id: floId }
      }),
    )

    enriched.sort((a, b) => {
      const aHasFlo = Boolean(a.floId)
      const bHasFlo = Boolean(b.floId)
      if (aHasFlo !== bHasFlo) return aHasFlo ? -1 : 1
      return 0
    })

    res.json({ results: enriched })
  } catch (error) {
    console.error('Search failed:', error)
    res.status(502).json({
      error: 'Failed to search wrestlers',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/api/wrestler/flow/:floId', async (req, res) => {
  const floId = req.params.floId.trim()

  if (!isFloId(floId)) {
    res.status(400).json({ error: 'Invalid FloWrestling ID' })
    return
  }

  try {
    res.json(await handleFloWrestler(floId))
  } catch (error) {
    console.error(`Fetch failed for Flo ${floId}:`, error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message.includes('not found') ? 404 : 502
    res.status(status).json({
      error: 'Failed to fetch wrestler from FloWrestling',
      message,
    })
  }
})

app.get('/api/wrestler/tw/:twId', async (req, res) => {
  const twId = req.params.twId.trim()

  if (!isTwId(twId)) {
    res.status(400).json({ error: 'Invalid twId' })
    return
  }

  try {
    res.json(await handleTwWrestler(twId))
  } catch (error) {
    console.error(`Fetch failed for TW ${twId}:`, error)
    res.status(502).json({
      error: 'Failed to fetch wrestler',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/api/wrestler/:id', async (req, res) => {
  const id = req.params.id.trim()

  if (isFloId(id)) {
    try {
      res.json(await handleFloWrestler(id))
    } catch (error) {
      console.error(`Fetch failed for Flo ${id}:`, error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      const status = message.includes('not found') ? 404 : 502
      res.status(status).json({
        error: 'Failed to fetch wrestler',
        message,
      })
    }
    return
  }

  if (isTwId(id)) {
    try {
      res.json(await handleTwWrestler(id))
    } catch (error) {
      console.error(`Fetch failed for TW ${id}:`, error)
      res.status(502).json({
        error: 'Failed to fetch wrestler',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    return
  }

  res.status(400).json({ error: 'Invalid wrestler ID' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
