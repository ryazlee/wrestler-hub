import type { CareerRecord, HeadToHeadRecord, Match } from '../types/wrestler'

export function isUnknownOpponentName(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return normalized === 'unknown' || normalized === 'unknown wrestler'
}

export function displayOpponentSchool(school: string): string | null {
  const normalized = school.trim()
  if (!normalized || normalized === '—' || normalized.toLowerCase() === 'unknown') {
    return null
  }
  return normalized
}

export function formatRecord(record: CareerRecord): string {
  return `${record.wins}-${record.losses}`
}

export function winPercentage(record: CareerRecord): number {
  const total = record.wins + record.losses
  if (total === 0) return 0
  return Math.round((record.wins / total) * 1000) / 10
}

export function winMethodPercentage(count: number, wins: number): number {
  if (wins === 0) return 0
  return Math.round((count / wins) * 1000) / 10
}

export function computeHeadToHead(matches: Match[]): HeadToHeadRecord[] {
  const map = new Map<
    string,
    HeadToHeadRecord & { twIds: Map<string, number>; floIds: Map<string, number> }
  >()

  for (const match of matches) {
    if (match.result !== 'W' && match.result !== 'L') continue
    if (isUnknownOpponentName(match.opponent)) continue

    const school = displayOpponentSchool(match.opponentSchool) ?? ''
    const key = `${match.opponent}|${school}`
    const existing = map.get(key) ?? {
      opponent: match.opponent,
      school,
      wins: 0,
      losses: 0,
      twIds: new Map<string, number>(),
      floIds: new Map<string, number>(),
    }

    if (match.result === 'W') {
      existing.wins += 1
    } else {
      existing.losses += 1
    }

    if (match.opponentTwId) {
      existing.twIds.set(
        match.opponentTwId,
        (existing.twIds.get(match.opponentTwId) ?? 0) + 1,
      )
    }
    if (match.opponentFloId) {
      existing.floIds.set(
        match.opponentFloId,
        (existing.floIds.get(match.opponentFloId) ?? 0) + 1,
      )
    }

    map.set(key, existing)
  }

  return [...map.values()]
    .map(({ twIds, floIds, ...record }) => ({
      ...record,
      opponentTwId: mostFrequent(twIds),
      opponentFloId: mostFrequent(floIds),
    }))
    .sort((a, b) => {
      const aTotal = a.wins + a.losses
      const bTotal = b.wins + b.losses
      return bTotal - aTotal
    })
}

function mostFrequent(counts: Map<string, number>): string | undefined {
  let best: string | undefined
  let bestCount = 0

  for (const [id, count] of counts) {
    if (count > bestCount) {
      best = id
      bestCount = count
    }
  }

  return best
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export type MatchOutcome =
  | 'Fall'
  | 'Tech fall'
  | 'Major decision'
  | 'Decision'
  | 'Other'

export function getMatchOutcome(match: Match): MatchOutcome {
  const text = `${match.method} ${match.score ?? ''}`.toLowerCase()

  if (/\btf\b|tech\s*fall/.test(text)) return 'Tech fall'
  if (/\bfall\b|\bf\s+\d/.test(text) && !/tech/.test(text)) return 'Fall'
  if (/major|\bmd\b/.test(text)) return 'Major decision'
  if (/decision|\bdec\b|sudden|forfeit|default|injury/.test(text)) return 'Decision'
  return 'Other'
}

export function formatMatchScore(match: Match): string | null {
  const method = match.method?.trim() ?? ''
  const score = match.score?.trim()

  if (score && score !== method && !method.includes(score)) return score

  const parenMatch = method.match(/\(([^)]+)\)\s*$/)
  if (parenMatch) return parenMatch[1]

  if (!score && method && getMatchOutcome(match) === 'Other') return method
  return null
}

export function formatResult(match: Match): string {
  const method = match.method?.trim() ?? ''
  const score = match.score?.trim()

  if (!score) return method || '—'
  if (!method) return score
  if (method === score || method.includes(`(${score})`)) return method
  return `${method} (${score})`
}

function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`)
  return `${count} ${word}`
}

export function formatBonusStats(
  falls: number,
  techs: number,
  majors: number,
): string {
  return [
    pluralize(falls, 'fall'),
    pluralize(techs, 'tech fall'),
    pluralize(majors, 'decision'),
  ].join(' · ')
}
