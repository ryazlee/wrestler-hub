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
