export function parseSearchQuery(query: string): {
  firstName: string
  lastName: string
} {
  const trimmed = query.trim().replace(/\s+/g, ' ')
  if (!trimmed) {
    return { firstName: '', lastName: '' }
  }

  const parts = trimmed.split(' ')
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export function parseWrestlerName(fullName: string): {
  firstName: string
  lastName: string
} {
  return parseSearchQuery(fullName)
}

export function wrestlerSearchPath(
  name: string,
  twId?: string,
  floId?: string,
): string {
  if (floId) return `/wrestler/${floId}`
  if (twId) return `/wrestler/${twId}`

  const q = name.trim()
  return `/?q=${encodeURIComponent(q)}`
}

export function canLinkWrestler(name: string, twId?: string, floId?: string): boolean {
  if (twId || floId) return true
  return name.trim().length >= 3
}
