import type { SearchResult } from '../types/wrestler'

export function getSearchOptionKey(option: SearchResult | string): string {
  if (typeof option === 'string') return option
  return option.id
}

export function getSearchOptionLabel(option: SearchResult | string): string {
  if (typeof option === 'string') return option
  return `${option.firstName} ${option.lastName}`.trim()
}
