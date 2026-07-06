const FLO_API = 'https://prod-web-api.flowrestling.org/api'

export interface FloAthlete {
  id: string
  coreId: string
  firstName: string
  lastName: string
  imageUrl?: string
  team?: { name: string; level?: string }
  weightClass?: string
  hometown?: string
}

export interface FloBoutResult {
  date: string
  opponent: {
    id?: string
    name: string
    teamName: string
    score?: string
  }
  athlete: {
    score?: string
    teamName: string
    isWinner: boolean
  }
  result: string
  resultTime?: string
  roundName?: string
  weight?: string
  winType?: string
  level?: string
}

export interface FloEventResult {
  id: string
  name: string
  firstResultAt: string
  lastResultAt: string
  boutResults: FloBoutResult[]
  athleteWins?: number
  athleteLosses?: number
}

export interface FloSeasonStats {
  wins: number
  losses: number
  falls: number
  techs: number
  majors: number
  decisions: number
  season: string
}

export interface FloStats {
  overallWins: number
  overallLosses: number
  falls: number
  techs: number
  majors: number
  perLevelStats?: {
    level?: string
    perSeasonStats: FloSeasonStats[]
  }[]
}

export interface FloWrestler {
  floId: string
  athlete: FloAthlete
  stats: FloStats | null
  results: FloEventResult[]
  profileUrl: string
}

interface FloResponse<T> {
  data: T
}

async function floFetch<T>(path: string): Promise<T | null> {
  const url = `${FLO_API}${path}`
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WrestlerHub/1.0)',
      Accept: 'application/json',
    },
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`FlowWrestling request failed: ${response.status} ${url}`)
  }

  const json = (await response.json()) as FloResponse<T>
  return json.data
}

export async function fetchFloAthlete(floId: string): Promise<FloAthlete | null> {
  return floFetch<FloAthlete>(`/athletes/${floId}`)
}

export async function fetchFloWrestler(floId: string): Promise<FloWrestler | null> {
  const [athlete, stats, results] = await Promise.all([
    floFetch<FloAthlete>(`/athletes/${floId}`),
    floFetch<FloStats>(`/athletes/${floId}/stats`),
    floFetch<FloEventResult[]>(`/athletes/${floId}/results`),
  ])

  if (!athlete) return null

  return {
    floId,
    athlete,
    stats,
    results: results ?? [],
    profileUrl: `https://www.flowrestling.org/nextgen/people/${floId}`,
  }
}

export async function resolveFloIdFromTwId(twId: string): Promise<string | null> {
  const response = await fetch(
    `https://www.trackwrestling.com/membership/ViewProfile.jsp?twId=${twId}`,
    {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WrestlerHub/1.0)' },
    },
  )

  const location = response.headers.get('location')
  if (!location) return null

  const match = location.match(/\/people\/([^/?#]+)/i)
  return match?.[1] ?? null
}
