import type { SearchResult, WrestlerData } from '../types/wrestler'

const API_BASE = '/api'

export async function search(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query.trim() })

  const response = await fetch(`${API_BASE}/search?${params}`)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? body.error ?? 'Search failed')
  }

  const data = await response.json()
  return data.results ?? []
}

export async function fetchWrestlerByTwId(twId: string): Promise<WrestlerData> {
  const response = await fetch(`${API_BASE}/wrestler/tw/${twId}`)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? body.error ?? 'Failed to load wrestler')
  }

  return response.json()
}

export async function fetchWrestlerByFloId(floId: string): Promise<WrestlerData> {
  const response = await fetch(`${API_BASE}/wrestler/flow/${floId}`)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? body.error ?? 'Failed to load wrestler')
  }

  return response.json()
}
