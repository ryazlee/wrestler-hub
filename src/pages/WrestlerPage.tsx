import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchWrestlerByFloId, fetchWrestlerByTwId } from '../api/client'
import { WrestlerProfileView } from '../components/WrestlerProfileView'
import type { WrestlerData } from '../types/wrestler'
import '../App.css'

function LoadingState({ message }: { message: string }) {
  return <p className="page-status">{message}</p>
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="page-status">
      <p className="error-message">{message}</p>
      <Link to="/" className="back-link">
        ← Back to search
      </Link>
    </div>
  )
}

export function WrestlerPage() {
  const { twId } = useParams<{ twId: string }>()
  const [data, setData] = useState<WrestlerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!twId) return

    setLoading(true)
    setError(null)

    fetchWrestlerByTwId(twId)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load wrestler'),
      )
      .finally(() => setLoading(false))
  }, [twId])

  if (loading) return <LoadingState message="Loading profile…" />
  if (error || !data) return <ErrorState message={error ?? 'Wrestler not found'} />

  return <WrestlerProfileView data={data} />
}

export function FloWrestlerPage() {
  const { floId } = useParams<{ floId: string }>()
  const [data, setData] = useState<WrestlerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!floId) return

    setLoading(true)
    setError(null)

    fetchWrestlerByFloId(floId)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load wrestler'),
      )
      .finally(() => setLoading(false))
  }, [floId])

  if (loading) return <LoadingState message="Loading profile…" />
  if (error || !data) return <ErrorState message={error ?? 'Wrestler not found'} />

  return <WrestlerProfileView data={data} />
}
