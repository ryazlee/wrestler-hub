import cors from 'cors'
import express from 'express'
import {
  fetchFloWrestler,
  resolveFloIdFromTwId,
} from './flowrestling.js'
import { fetchWrestler, searchWrestlers, searchWrestlersByHometown } from './trackwrestling.js'
import { parseSearchQuery } from './search-query.js'
import { mergeWrestlerData } from './wrestler-data.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

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
        return { ...result, floId: floId ?? undefined }
      }),
    )

    res.json({ results: enriched })
  } catch (error) {
    console.error('Search failed:', error)
    res.status(502).json({
      error: 'Failed to search Trackwrestling',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

async function handleTwWrestler(twId: string) {
  const [tw, floId] = await Promise.all([
    fetchWrestler(twId),
    resolveFloIdFromTwId(twId).catch(() => null),
  ])

  const flo = floId ? await fetchFloWrestler(floId).catch(() => null) : null
  return mergeWrestlerData(tw, flo)
}

app.get('/api/wrestler/tw/:twId', async (req, res) => {
  const twId = req.params.twId.trim()

  if (!/^\d+$/.test(twId)) {
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

app.get('/api/wrestler/flow/:floId', async (req, res) => {
  const floId = req.params.floId.trim()

  if (!/^[a-zA-Z0-9]+$/.test(floId)) {
    res.status(400).json({ error: 'Invalid FloWrestling ID' })
    return
  }

  try {
    const flo = await fetchFloWrestler(floId)
    if (!flo) {
      res.status(404).json({ error: 'Wrestler not found on FloWrestling' })
      return
    }

    res.json(mergeWrestlerData(null, flo))
  } catch (error) {
    console.error(`Fetch failed for Flo ${floId}:`, error)
    res.status(502).json({
      error: 'Failed to fetch wrestler from FloWrestling',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/api/wrestler/:twId', async (req, res) => {
  const twId = req.params.twId.trim()

  if (!/^\d+$/.test(twId)) {
    res.status(400).json({ error: 'Invalid twId' })
    return
  }

  try {
    res.json(await handleTwWrestler(twId))
  } catch (error) {
    console.error(`Fetch failed for ${twId}:`, error)
    res.status(502).json({
      error: 'Failed to fetch wrestler',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
