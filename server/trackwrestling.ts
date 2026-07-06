import * as cheerio from 'cheerio'

const TW_BASE = 'https://www.trackwrestling.com'

export interface SearchResult {
  twId: string
  firstName: string
  lastName: string
  stateId: string
  state: string
  birthDate: string
  hometown: string
}

export interface ScrapedPlacement {
  date: string
  event: string
  weight: string
  placement: number
  placementLabel: string
  eventType: string
}

export interface ScrapedSigWin {
  date: string
  event: string
  opponent: string
  opponentSchool?: string
  method: string
}

export interface ScrapedMatch {
  date: string
  opponent: string
  opponentSchool: string
  opponentTwId?: string
  wrestlerTeam: string
  result?: 'W' | 'L'
  method?: string
  event: string
  weight?: string
  round?: string
}

export interface ScrapedWrestler {
  twId: string
  name: string
  hometown: string
  team: string
  record: { wins: number; losses: number }
  pins: number
  techs: number
  majors: number
  weightClass?: string
  placements: ScrapedPlacement[]
  sigWins: ScrapedSigWin[]
  matches: ScrapedMatch[]
  trackwrestlingUrl: string
}

async function twFetch(path: string, init?: RequestInit): Promise<string> {
  const url = path.startsWith('http') ? path : `${TW_BASE}${path}`
  const response = await fetch(url, {
    ...init,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WrestlerHub/1.0)',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Trackwrestling request failed: ${response.status} ${url}`)
  }

  return response.text()
}

async function twFetchJson<T>(path: string): Promise<T | null> {
  const text = await twFetch(path)
  const trimmed = text.trim()
  if (!trimmed || trimmed === 'null') {
    return null
  }
  if (trimmed.includes('not a valid function')) {
    throw new Error(`Invalid Trackwrestling function: ${path}`)
  }
  return JSON.parse(trimmed) as T
}

function parseDelimitedBlock(html: string, elementId: string): string[][] {
  const $ = cheerio.load(html)
  const raw = $(`#${elementId}`).text().trim()
  if (!raw) return []

  return raw
    .split('[end]')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.split('~'))
}

function formatPlacement(place: string): { placement: number; placementLabel: string } {
  const num = parseInt(place, 10)
  if (num === -1) return { placement: -1, placementLabel: 'DNP' }
  if (num === 0) return { placement: 0, placementLabel: '—' }
  const suffix =
    num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'
  return { placement: num, placementLabel: `${num}${suffix}` }
}

function formatDateYmd(ymd: string): string {
  if (ymd.length !== 8) return ymd
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`
}

function parseMetaRecord(html: string): {
  wins: number
  losses: number
  pins: number
  techs: number
  majors: number
} {
  const match = html.match(
    /Record:(\d+)-(\d+)\s+Pins:(\d+)\s+Techs:(\d+)\s+Majors:(\d+)/i,
  )
  if (!match) {
    return { wins: 0, losses: 0, pins: 0, techs: 0, majors: 0 }
  }

  return {
    wins: parseInt(match[1], 10),
    losses: parseInt(match[2], 10),
    pins: parseInt(match[3], 10),
    techs: parseInt(match[4], 10),
    majors: parseInt(match[5], 10),
  }
}

function parseProfileIdentity(html: string): { name: string; hometown: string } {
  const titleMatch = html.match(
    /og:title'\s+content='([^(|]+)(?:\(([^)]+)\))?/i,
  )
  const name = titleMatch?.[1]?.trim() ?? 'Unknown Wrestler'
  const hometown = titleMatch?.[2]?.trim() ?? ''
  return { name, hometown }
}

function parsePlacements(html: string): ScrapedPlacement[] {
  return parseDelimitedBlock(html, 'placementData').map((fields) => {
    const { placement, placementLabel } = formatPlacement(fields[3] ?? '')
    return {
      date: formatDateYmd(fields[0] ?? ''),
      event: fields[1] ?? '',
      weight: fields[2] ?? '',
      placement,
      placementLabel,
      eventType: fields[4] ?? '',
    }
  })
}

function parseSigWins(html: string): ScrapedSigWin[] {
  return parseDelimitedBlock(html, 'sigWinsData').map((fields) => ({
    date: formatDateYmd(fields[2] ?? ''),
    event: fields[3] ?? '',
    method: fields[5] ?? '',
    opponent: `${fields[6] ?? ''} ${fields[7] ?? ''}`.trim(),
  }))
}

type RawMatchRow = [
  string, string, string, string, string, string, string, string,
  string, string, string, string, string, string | null,
  string, string, string, string,
  string | null, string, string, string,
  string, string,
]

function parseMatchesFromProfile(html: string): ScrapedMatch[] {
  const jsonMatch = html.match(/var jsonRelatedMatches = "(\[\[.*?\]\])";/s)
  if (!jsonMatch) return []

  const raw = jsonMatch[1].replace(/\\"/g, '"')
  const rows = JSON.parse(raw) as RawMatchRow[]

  return rows.map((row) => ({
    date: formatDateYmd((row[12] ?? '').slice(0, 8)),
    opponent: `${row[19] ?? ''} ${row[20] ?? ''}`.trim() || 'Unknown',
    opponentSchool: row[21] ?? '',
    opponentTwId: row[18] && row[18] !== 'null' ? row[18] : undefined,
    wrestlerTeam: row[17] ?? '',
    event: row[2] ?? '',
    weight: row[6] ?? '',
    round: row[7] ?? '',
  }))
}

function enrichMatchesWithSigWins(
  matches: ScrapedMatch[],
  sigWins: ScrapedSigWin[],
): ScrapedMatch[] {
  const sigWinKeys = new Set(
    sigWins.map((w) => `${w.date}|${w.opponent.toLowerCase()}|${w.event.toLowerCase()}`),
  )

  return matches.map((match) => {
    const key = `${match.date}|${match.opponent.toLowerCase()}|${match.event.toLowerCase()}`
    const sigWin = sigWins.find(
      (w) =>
        w.date === match.date &&
        w.opponent.toLowerCase() === match.opponent.toLowerCase() &&
        w.event.toLowerCase() === match.event.toLowerCase(),
    )

    if (sigWin || sigWinKeys.has(key)) {
      return {
        ...match,
        result: 'W' as const,
        method: sigWin?.method ?? 'Win',
      }
    }

    return match
  })
}

export async function searchWrestlers(
  firstName: string,
  lastName: string,
  stateId?: string,
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    function: 'getPossibleTWProfiles',
    firstName,
    lastName,
  })
  if (stateId) params.set('stateId', stateId)

  const rows = await twFetchJson<string[][]>(
    `/AjaxFunctions.jsp?${params.toString()}`,
  )

  return (rows ?? []).map((row) => ({
    twId: row[0],
    firstName: row[1],
    lastName: row[2],
    stateId: row[3],
    state: row[4],
    birthDate: row[5],
    hometown: row[6],
  }))
}

export async function searchWrestlersByHometown(
  hometown: string,
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    function: 'getPossibleTWProfiles',
    firstName: '',
    lastName: '',
    hometown,
  })

  const rows = await twFetchJson<string[][]>(
    `/AjaxFunctions.jsp?${params.toString()}`,
  )

  return (rows ?? []).map((row) => ({
    twId: row[0],
    firstName: row[1],
    lastName: row[2],
    stateId: row[3],
    state: row[4],
    birthDate: row[5],
    hometown: row[6],
  }))
}

export async function fetchTwWeightClass(twId: string): Promise<string | undefined> {
  const matchRows = await twFetchJson<RawMatchRow[]>(
    `/AjaxFunctions.jsp?function=getProfileMatchVideosJSP&twIds=${twId}`,
  ).catch(() => null)

  if (!Array.isArray(matchRows)) return undefined

  for (const row of matchRows) {
    const weight = row[6]?.trim()
    if (weight) return weight
  }

  return undefined
}

export async function fetchWrestlerTeamName(
  twId: string,
): Promise<{ name: string; team: string }> {
  const [profileHtml, matchRows] = await Promise.all([
    twFetch(`/tw/membership/ViewProfile.jsp?twId=${twId}`),
    twFetchJson<RawMatchRow[]>(
      `/AjaxFunctions.jsp?function=getProfileMatchVideosJSP&twIds=${twId}`,
    ).catch(() => null),
  ])

  const { name } = parseProfileIdentity(profileHtml)
  const team =
    (Array.isArray(matchRows)
      ? matchRows.find((row) => row[17])?.[17]
      : undefined) ?? '—'

  return { name, team }
}

export async function fetchWrestler(twId: string): Promise<ScrapedWrestler> {
  const [profileHtml, matchRows] = await Promise.all([
    twFetch(`/tw/membership/ViewProfile.jsp?twId=${twId}`),
    twFetchJson<RawMatchRow[]>(
      `/AjaxFunctions.jsp?function=getProfileMatchVideosJSP&twIds=${twId}`,
    ).catch(() => null),
  ])

  const { name, hometown } = parseProfileIdentity(profileHtml)
  const record = parseMetaRecord(profileHtml)
  const placements = parsePlacements(profileHtml)
  const sigWins = parseSigWins(profileHtml)

  const matchesFromHtml = parseMatchesFromProfile(profileHtml)
  const normalizedMatchRows = Array.isArray(matchRows) ? matchRows : []
  const matchesFromAjax =
    normalizedMatchRows.length > 0
      ? normalizedMatchRows.map((row) => ({
          date: formatDateYmd((row[12] ?? '').slice(0, 8)),
          opponent: `${row[19] ?? ''} ${row[20] ?? ''}`.trim() || 'Unknown',
          opponentSchool: row[21] ?? '',
          opponentTwId: row[18] && row[18] !== 'null' ? row[18] : undefined,
          wrestlerTeam: row[17] ?? '',
          event: row[2] ?? '',
          weight: row[6] ?? '',
          round: row[7] ?? '',
        }))
      : matchesFromHtml

  const latestWeight =
    matchesFromAjax[0]?.weight ?? placements[0]?.weight ?? undefined

  const team =
    matchesFromAjax.find((m) => m.wrestlerTeam)?.wrestlerTeam ?? '—'

  return {
    twId,
    name,
    hometown,
    team,
    record,
    pins: record.pins,
    techs: record.techs,
    majors: record.majors,
    weightClass: latestWeight,
    placements,
    sigWins,
    matches: enrichMatchesWithSigWins(matchesFromAjax, sigWins),
    trackwrestlingUrl: `${TW_BASE}/tw/membership/ViewProfile.jsp?twId=${twId}`,
  }
}
