import type { FloAthlete, FloWrestler } from './flowrestling.js'
import type { ScrapedWrestler, SearchResult } from './trackwrestling.js'

export interface TwProfileSignals {
  name: string
  firstName?: string
  lastName?: string
  hometown?: string
  state?: string
  teams?: string[]
}

const STATE_NAMES: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function normalizeState(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length === 2) return trimmed.toUpperCase()
  return STATE_NAMES[trimmed.toLowerCase()]
}

function parseHometown(hometown: string): { city?: string; state?: string } {
  const parts = hometown
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 2) {
    return {
      city: normalizeToken(parts[0]),
      state: normalizeState(parts[parts.length - 1]),
    }
  }

  return { city: normalizeToken(hometown) }
}

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { first: '', last: parts[0] }
  return { first: parts[0], last: parts[parts.length - 1] }
}

function firstNamesCompatible(a: string, b: string): boolean {
  const left = normalizeToken(a)
  const right = normalizeToken(b)
  if (!left || !right) return true
  if (left === right) return true
  if (left.length >= 2 && right.length >= 2) {
    return left.startsWith(right) || right.startsWith(left)
  }
  return false
}

function normalizeTeam(team: string): string {
  return team
    .toLowerCase()
    .replace(/\b(high school|middle school|junior high|wrestling club|wrestling|wc|hs|ms)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function teamsOverlap(a: string, b: string): boolean {
  const left = normalizeTeam(a)
  const right = normalizeTeam(b)
  if (!left || !right) return false
  if (left === right) return true
  if (left.length >= 4 && right.length >= 4) {
    return left.includes(right) || right.includes(left)
  }
  return false
}

function hometownsOverlap(
  twHometown?: string,
  twState?: string,
  floHometown?: string,
): boolean {
  const tw = parseHometown(twHometown ?? '')
  const flo = parseHometown(floHometown ?? '')
  const twStateCode = twState ? normalizeState(twState) : undefined

  const states = [tw.state, twStateCode, flo.state].filter(Boolean) as string[]
  const uniqueStates = new Set(states)
  if (uniqueStates.size > 1) return false

  if (tw.city && flo.city) {
    return tw.city === flo.city || tw.city.includes(flo.city) || flo.city.includes(tw.city)
  }

  if (tw.city && floHometown) {
    return normalizeToken(floHometown).includes(tw.city)
  }

  return false
}

function anyTeamOverlap(left: string[], right: string[]): boolean {
  return left.some((a) => right.some((b) => teamsOverlap(a, b)))
}

export function twSignalsFromSearch(result: SearchResult): TwProfileSignals {
  return {
    name: `${result.firstName} ${result.lastName}`.trim(),
    firstName: result.firstName,
    lastName: result.lastName,
    hometown: result.hometown,
    state: result.state,
  }
}

export function twSignalsFromScraped(tw: ScrapedWrestler): TwProfileSignals {
  const teams = new Set<string>()
  if (tw.team && tw.team !== '—') teams.add(tw.team)
  for (const match of tw.matches) {
    if (match.wrestlerTeam) teams.add(match.wrestlerTeam)
  }

  return {
    name: tw.name,
    hometown: tw.hometown,
    teams: [...teams],
  }
}

export function floSignalsFromAthlete(
  athlete: FloAthlete,
  flo?: FloWrestler,
): {
  firstName: string
  lastName: string
  hometown?: string
  teams: string[]
} {
  const teams = new Set<string>()
  if (athlete.team?.name) teams.add(athlete.team.name)

  if (flo) {
    for (const event of flo.results) {
      for (const bout of event.boutResults ?? []) {
        if (bout.athlete.teamName) teams.add(bout.athlete.teamName)
      }
    }
  }

  return {
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    hometown: athlete.hometown,
    teams: [...teams],
  }
}

export function profilesLikelyMatch(
  tw: TwProfileSignals,
  flo: {
    firstName: string
    lastName: string
    hometown?: string
    teams?: string[]
  },
): boolean {
  const twName = splitName(tw.name)
  const twFirst = tw.firstName ?? twName.first
  const twLast = tw.lastName ?? twName.last

  if (normalizeToken(twLast) !== normalizeToken(flo.lastName)) {
    return false
  }

  if (!firstNamesCompatible(twFirst, flo.firstName)) {
    return false
  }

  const hometownMatch = hometownsOverlap(tw.hometown, tw.state, flo.hometown)
  const teamMatch = anyTeamOverlap(tw.teams ?? [], flo.teams ?? [])

  if (hometownMatch || teamMatch) return true

  const twHasHometown = Boolean(tw.hometown?.trim() || tw.state?.trim())
  const floHasHometown = Boolean(flo.hometown?.trim())
  const twHasTeam = (tw.teams ?? []).some((team) => team && team !== '—')
  const floHasTeam = (flo.teams ?? []).some(Boolean)

  if (twHasHometown && floHasHometown) return false
  if (twHasTeam && floHasTeam) return false

  return normalizeToken(twFirst) === normalizeToken(flo.firstName)
}
