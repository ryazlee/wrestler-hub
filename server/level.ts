export type CareerLevel = 'hs' | 'college' | 'other'

export function classifyCareerLevel(text: string): CareerLevel {
  const normalized = text.toLowerCase()

  if (
    /ncaa|njcaa|naia|collegiate|college|university|\bd1\b|\bd2\b|\bd3\b|division\s*i{1,3}\b/.test(
      normalized,
    )
  ) {
    return 'college'
  }

  if (
    /high school|high-school|middle school|junior high|\bhs\b|youth|cadet|u\d{2}\b/.test(
      normalized,
    )
  ) {
    return 'hs'
  }

  return 'hs'
}

export function classifyFloLevel(level?: string): CareerLevel {
  if (!level?.trim()) return 'hs'
  return classifyCareerLevel(level)
}

export function classifyFromEvent(...parts: (string | undefined)[]): CareerLevel {
  const text = parts.filter(Boolean).join(' ')
  if (!text.trim()) return 'hs'
  return classifyCareerLevel(text)
}
