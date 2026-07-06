import type {
  Accolade,
  CareerLevel,
  Match,
  TimelineEntry,
} from '../types/wrestler'

export type LevelFilter = 'all' | 'hs' | 'college'

/** Map FloWrestling level strings to our career buckets. */
export function mapFloLevel(level?: string | null): CareerLevel | undefined {
  if (!level?.trim()) return undefined

  const normalized = level.trim().toLowerCase().replace(/\s+/g, '-')

  if (normalized === 'high-school' || normalized === 'highschool') return 'hs'
  if (normalized === 'college' || normalized === 'collegiate') return 'college'
  if (
    normalized === 'youth' ||
    normalized === 'other' ||
    normalized === 'international' ||
    normalized === 'open'
  ) {
    return 'other'
  }

  return undefined
}

export function resolveItemLevel(item: {
  level?: CareerLevel
}): CareerLevel {
  if (item.level) return item.level
  // Legacy TW-tagged responses without an explicit level.
  return 'hs'
}

export function matchesLevelFilter(
  item: { level?: CareerLevel },
  filter: LevelFilter,
): boolean {
  if (filter === 'all') return true
  const level = resolveItemLevel(item)
  if (filter === 'hs') return level === 'hs'
  return level === 'college'
}

export function filterTimeline(
  timeline: TimelineEntry[],
  filter: LevelFilter,
): TimelineEntry[] {
  return timeline.filter((entry) => matchesLevelFilter(entry, filter))
}

export function filterAccolades(
  accolades: Accolade[],
  filter: LevelFilter,
): Accolade[] {
  return accolades.filter((accolade) => matchesLevelFilter(accolade, filter))
}

export function filterMatches(matches: Match[], filter: LevelFilter): Match[] {
  return matches.filter((match) => matchesLevelFilter(match, filter))
}

function recordFromMatches(matches: Match[]): { wins: number; losses: number } {
  let wins = 0
  let losses = 0

  for (const match of matches) {
    if (match.result === 'W') wins += 1
    else if (match.result === 'L') losses += 1
  }

  return { wins, losses }
}

function recordFromTimeline(timeline: TimelineEntry[]): {
  wins: number
  losses: number
} {
  let wins = 0
  let losses = 0

  for (const entry of timeline) {
    if (!entry.record) continue
    wins += entry.record.wins
    losses += entry.record.losses
  }

  return { wins, losses }
}

function bonusFromMatches(matches: Match[]): {
  pins: number
  techs: number
  majors: number
} {
  let pins = 0
  let techs = 0
  let majors = 0

  for (const match of matches) {
    if (match.result !== 'W') continue
    const method = match.method.toLowerCase()
    if (method.includes('fall') && !method.includes('tech')) pins += 1
    else if (method.includes('tech')) techs += 1
    else if (method.includes('major') || method.includes('decision')) majors += 1
  }

  return { pins, techs, majors }
}

function bonusFromTimeline(timeline: TimelineEntry[]): {
  pins: number
  techs: number
  majors: number
} {
  let pins = 0
  let techs = 0
  let majors = 0

  for (const entry of timeline) {
    pins += entry.falls ?? 0
    techs += entry.techs ?? 0
    majors += entry.majors ?? 0
  }

  return { pins, techs, majors }
}

export function hasCollegeData(data: {
  timeline: TimelineEntry[]
  accolades: Accolade[]
  matches: Match[]
}): boolean {
  return (
    data.timeline.some((entry) => resolveItemLevel(entry) === 'college') ||
    data.accolades.some((accolade) => resolveItemLevel(accolade) === 'college') ||
    data.matches.some((match) => resolveItemLevel(match) === 'college')
  )
}

export function profileForLevel(
  profile: import('../types/wrestler').WrestlerProfile,
  timeline: TimelineEntry[],
  matches: Match[],
  filter: LevelFilter,
): import('../types/wrestler').WrestlerProfile {
  if (filter === 'all') return profile

  const filteredTimeline = filterTimeline(timeline, filter)
  const filteredMatches = filterMatches(matches, filter)

  const matchRecord = recordFromMatches(filteredMatches)
  const timelineRecord = recordFromTimeline(filteredTimeline)
  const careerRecord =
    matchRecord.wins + matchRecord.losses > 0 ? matchRecord : timelineRecord

  const matchBonus = bonusFromMatches(filteredMatches)
  const timelineBonus = bonusFromTimeline(filteredTimeline)
  const bonus =
    matchBonus.pins + matchBonus.techs + matchBonus.majors > 0
      ? matchBonus
      : timelineBonus

  return {
    ...profile,
    careerRecord,
    pins: bonus.pins,
    techs: bonus.techs,
    majors: bonus.majors,
  }
}

export const LEVEL_FILTER_OPTIONS: { id: LevelFilter; label: string }[] = [
  { id: 'all', label: 'All-time' },
  { id: 'hs', label: 'High school' },
  { id: 'college', label: 'College' },
]
