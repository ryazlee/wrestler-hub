export function placementEmoji(placement?: string, title?: string): string {
  const normalizedTitle = title?.toLowerCase() ?? ''
  const normalizedPlacement = placement?.toLowerCase() ?? ''

  if (normalizedTitle.includes('champion') || normalizedPlacement.startsWith('1')) {
    return '🥇'
  }
  if (normalizedPlacement.startsWith('2')) return '🥈'
  if (normalizedPlacement.startsWith('3')) return '🥉'
  if (/^[4-8]/.test(normalizedPlacement)) return '🏅'
  if (normalizedTitle.includes('sig')) return '⭐'
  return '🏆'
}

export function placementAccent(
  placement?: string,
  title?: string,
): { border: string; background: string } {
  const normalizedTitle = title?.toLowerCase() ?? ''
  const normalizedPlacement = placement?.toLowerCase() ?? ''

  if (normalizedTitle.includes('champion') || normalizedPlacement.startsWith('1')) {
    return { border: '#f59e0b', background: '#fffbeb' }
  }
  if (normalizedPlacement.startsWith('2')) {
    return { border: '#94a3b8', background: '#f8fafc' }
  }
  if (normalizedPlacement.startsWith('3')) {
    return { border: '#d97706', background: '#fff7ed' }
  }
  return { border: '#e5e7eb', background: '#fafafa' }
}
