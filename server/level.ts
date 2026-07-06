export type CareerLevel = 'hs' | 'college' | 'other'

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

export function resolveCareerLevel(options: {
  level?: CareerLevel
  floLevel?: string | null
  source?: 'trackwrestling' | 'flowrestling'
}): CareerLevel {
  if (options.level) return options.level

  const fromFlo = mapFloLevel(options.floLevel)
  if (fromFlo) return fromFlo

  // Trackwrestling profiles are overwhelmingly high school.
  if (options.source === 'trackwrestling') return 'hs'

  return 'other'
}
