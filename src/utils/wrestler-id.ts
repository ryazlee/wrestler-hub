/** Flo IDs are alphanumeric and include at least one letter. */
export function isFloId(id: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(id) && /[a-zA-Z]/.test(id)
}

/** Trackwrestling IDs are numeric. */
export function isTwId(id: string): boolean {
  return /^\d+$/.test(id)
}

export function canonicalWrestlerId(profile: {
  floId?: string
  twId?: string
}): string | undefined {
  return profile.floId ?? profile.twId
}
