import type { FloEventResult, FloSeasonStats, FloWrestler } from './flowrestling.js'
import { resolveCareerLevel, type CareerLevel } from './level.js'
import type { ScrapedWrestler } from './trackwrestling.js'

export interface CareerRecord {
  wins: number
  losses: number
}

export interface WrestlerProfile {
  name: string
  school: string
  graduationYear: number
  weightClass: string
  hometown?: string
  twId?: string
  floId?: string
  trackwrestlingUrl?: string
  flowrestlingUrl?: string
  imageUrl?: string
  links?: { label: string; url: string }[]
  careerRecord: CareerRecord
  pins?: number
  techs?: number
  majors?: number
  statsNote?: string
  sources: ('trackwrestling' | 'flowrestling')[]
}

export interface Accolade {
  title: string
  year: number
  event?: string
  placement?: string
  level?: 'hs' | 'college' | 'other'
}

export interface TimelineEntry {
  year: number
  team: string
  season?: string
  record?: { wins: number; losses: number }
  falls?: number
  techs?: number
  majors?: number
  source?: 'trackwrestling' | 'flowrestling'
  level?: 'hs' | 'college' | 'other'
}

export interface Match {
  date: string
  opponent: string
  opponentSchool: string
  opponentTwId?: string
  opponentFloId?: string
  result: 'W' | 'L' | '—'
  method: string
  score?: string
  event: string
  weight?: number
  level?: 'hs' | 'college' | 'other'
}

export interface WrestlerData {
  profile: WrestlerProfile
  accolades: Accolade[]
  timeline: TimelineEntry[]
  matches: Match[]
}

function seasonToYear(season: string): number {
  const parts = season.split('-')
  const raw = parseInt(parts[parts.length - 1], 10)
  if (!raw) return new Date().getFullYear()
  if (raw < 100) return 2000 + raw
  return raw
}

function timelineRichness(entry: TimelineEntry): number {
  let score = 0
  if (entry.record) score += 20
  if (entry.season) score += 5
  if (entry.team && entry.team !== '—') score += 1
  return score
}

function mergeTimelines(
  flo: TimelineEntry[],
  tw: TimelineEntry[],
): TimelineEntry[] {
  const byYear = new Map<number, TimelineEntry>()

  for (const entry of [...flo, ...tw]) {
    const existing = byYear.get(entry.year)
    if (!existing || timelineRichness(entry) > timelineRichness(existing)) {
      byYear.set(entry.year, entry)
    }
  }

  return [...byYear.values()].sort((a, b) => b.year - a.year)
}

function isFloProfileId(id?: string): boolean {
  return !!id && /[a-zA-Z]/.test(id)
}

function floResultsToMatches(results: FloEventResult[]): Match[] {
  const matches: Match[] = []

  for (const event of results) {
    for (const bout of event.boutResults ?? []) {
      matches.push({
        date: bout.date.slice(0, 10),
        opponent: bout.opponent.name?.trim() || 'Unknown',
        opponentSchool: bout.opponent.teamName ?? '',
        opponentFloId: isFloProfileId(bout.opponent.id)
          ? bout.opponent.id
          : undefined,
        result: bout.athlete.isWinner ? 'W' : 'L',
        method: bout.winType ? winTypeLabel(bout.winType) : bout.result,
        score: bout.winType ? bout.result : undefined,
        event: event.name,
        weight: bout.weight ? parseInt(bout.weight, 10) || undefined : undefined,
        level: resolveCareerLevel({
          floLevel: bout.level,
          source: 'flowrestling',
        }),
      })
    }
  }

  return matches.sort((a, b) => b.date.localeCompare(a.date))
}

function enrichFloMatchesWithTwIds(
  floMatches: Match[],
  twMatches: Match[],
): Match[] {
  const twByKey = new Map<string, string>()

  for (const match of twMatches) {
    if (!match.opponentTwId) continue
    const key = `${match.date}|${match.opponent.toLowerCase()}`
    twByKey.set(key, match.opponentTwId)
  }

  return floMatches.map((match) => {
    if (!match.opponent) return match
    const twId = twByKey.get(`${match.date}|${match.opponent.toLowerCase()}`)
    return twId ? { ...match, opponentTwId: twId } : match
  })
}

function winTypeLabel(winType: string): string {
  const labels: Record<string, string> = {
    F: 'Fall',
    TF: 'Tech Fall',
    MD: 'Major Decision',
    DEC: 'Decision',
    SV: 'Sudden Victory',
  }
  return labels[winType.toUpperCase()] ?? winType
}

function floSeasonsToTimeline(
  flo: FloWrestler,
  teamName: string,
): TimelineEntry[] {
  const seasons: { season: FloSeasonStats; level: CareerLevel }[] = []

  for (const levelStats of flo.stats?.perLevelStats ?? []) {
    const level = resolveCareerLevel({
      floLevel: levelStats.level,
      source: 'flowrestling',
    })
    for (const season of levelStats.perSeasonStats ?? []) {
      seasons.push({ season, level })
    }
  }

  return seasons.map(({ season, level }) => ({
    year: seasonToYear(season.season),
    season: season.season,
    team: teamName,
    record: { wins: season.wins, losses: season.losses },
    falls: season.falls,
    techs: season.techs,
    majors: season.majors,
    source: 'flowrestling' as const,
    level,
  }))
}

function twToPartial(tw: ScrapedWrestler): WrestlerData {
  const timelineMap = new Map<number, TimelineEntry>()

  for (const placement of tw.placements) {
    const year = parseInt(placement.date.slice(0, 4), 10)
    if (tw.team === '—') continue
    if (!timelineMap.has(year)) {
      timelineMap.set(year, {
        year,
        team: tw.team,
        source: 'trackwrestling',
        level: 'hs',
      })
    }
  }

  const accolades = [
    ...tw.placements
      .filter((p) => p.placement > 0)
      .map((p) => ({
        title: p.placementLabel === '1st' ? 'Champion' : `${p.placementLabel} Place`,
        year: parseInt(p.date.slice(0, 4), 10),
        event: p.event,
        placement: p.placementLabel,
        level: 'hs',
      })),
    ...tw.sigWins.map((w) => ({
      title: 'Significant Win',
      year: parseInt(w.date.slice(0, 4), 10),
      event: w.event,
      placement: `vs ${w.opponent} (${w.method})`,
      level: 'hs',
    })),
  ]

  return {
    profile: {
      name: tw.name,
      school: tw.team,
      graduationYear: 0,
      weightClass: tw.weightClass ?? '—',
      hometown: tw.hometown,
      twId: tw.twId,
      trackwrestlingUrl: tw.trackwrestlingUrl,
      links: [{ label: 'Trackwrestling Profile', url: tw.trackwrestlingUrl }],
      careerRecord: { wins: tw.record.wins, losses: tw.record.losses },
      pins: tw.pins,
      techs: tw.techs,
      majors: tw.majors,
      statsNote: 'Record reflects past 365 days on Trackwrestling',
      sources: ['trackwrestling'],
    },
    accolades,
    timeline: [...timelineMap.values()].sort((a, b) => b.year - a.year),
    matches: tw.matches.map((m) => ({
      date: m.date,
      opponent: m.opponent,
      opponentSchool: m.opponentSchool,
      opponentTwId: m.opponentTwId,
      result: m.result ?? '—',
      method: m.method ?? m.round ?? '—',
      event: m.event,
      weight: m.weight ? parseInt(m.weight, 10) || undefined : undefined,
      level: resolveCareerLevel({ source: 'trackwrestling' }),
    })),
  }
}

function floToPartial(flo: FloWrestler): WrestlerData {
  const { athlete, stats } = flo
  const teamName = athlete.team?.name ?? '—'

  return {
    profile: {
      name: `${athlete.firstName} ${athlete.lastName}`.trim(),
      school: teamName,
      graduationYear: 0,
      weightClass: athlete.weightClass ?? '—',
      hometown: athlete.hometown,
      floId: flo.floId,
      flowrestlingUrl: flo.profileUrl,
      imageUrl: athlete.imageUrl,
      links: [{ label: 'FloWrestling Profile', url: flo.profileUrl }],
      careerRecord: {
        wins: stats?.overallWins ?? 0,
        losses: stats?.overallLosses ?? 0,
      },
      pins: stats?.falls,
      techs: stats?.techs,
      majors: stats?.majors,
      statsNote: 'Career record from FloWrestling',
      sources: ['flowrestling'],
    },
    accolades: [],
    timeline: floSeasonsToTimeline(flo, teamName),
    matches: floResultsToMatches(flo.results),
  }
}

export function mergeWrestlerData(
  tw: ScrapedWrestler | null,
  flo: FloWrestler | null,
): WrestlerData {
  if (!tw && !flo) {
    throw new Error('No wrestler data available')
  }

  if (!flo) return twToPartial(tw!)
  if (!tw) return floToPartial(flo)

  const twData = twToPartial(tw)
  const floData = floToPartial(flo)
  const floMatches = floData.matches
  const useFloMatches = floMatches.length > 0

  const timelineByYear = mergeTimelines(floData.timeline, twData.timeline)

  const links = [
    ...(twData.profile.links ?? []),
    ...(floData.profile.links ?? []),
  ]

  const sources: ('trackwrestling' | 'flowrestling')[] = ['trackwrestling', 'flowrestling']

  return {
    profile: {
      name: floData.profile.name || twData.profile.name,
      school: floData.profile.school !== '—' ? floData.profile.school : twData.profile.school,
      graduationYear: 0,
      weightClass:
        floData.profile.weightClass !== '—'
          ? floData.profile.weightClass
          : twData.profile.weightClass,
      hometown: floData.profile.hometown || twData.profile.hometown,
      twId: tw.twId,
      floId: flo.floId,
      trackwrestlingUrl: tw.trackwrestlingUrl,
      flowrestlingUrl: flo.profileUrl,
      imageUrl: floData.profile.imageUrl,
      links,
      careerRecord: flo.stats
        ? floData.profile.careerRecord
        : twData.profile.careerRecord,
      pins: flo.stats?.falls ?? twData.profile.pins,
      techs: flo.stats?.techs ?? twData.profile.techs,
      majors: flo.stats?.majors ?? twData.profile.majors,
      statsNote: flo.stats
        ? 'Career record from FloWrestling; tournament placements from Trackwrestling'
        : twData.profile.statsNote,
      sources,
    },
    accolades: twData.accolades,
    timeline: timelineByYear,
    matches: useFloMatches
      ? enrichFloMatchesWithTwIds(floMatches, twData.matches)
      : twData.matches,
  }
}
