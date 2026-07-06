import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchWrestler } from '../api/client'
import { WrestlerProfileView } from '../components/WrestlerProfileView'
import type { WrestlerData } from '../types/wrestler'
import { canonicalWrestlerId, isTwId } from '../utils/wrestler-id'
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
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<WrestlerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)

    fetchWrestler(id)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load wrestler'),
      )
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!data || !id) return

    const canonicalId = canonicalWrestlerId(data.profile)
    if (canonicalId && isTwId(id) && canonicalId !== id) {
      navigate(`/wrestler/${canonicalId}`, { replace: true })
    }
  }, [data, id, navigate])

  if (loading) return <LoadingState message="Loading profile…" />
  if (error || !data) return <ErrorState message={error ?? 'Wrestler not found'} />

  return <WrestlerProfileView data={data} />
}
