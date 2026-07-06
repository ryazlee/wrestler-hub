import { Link } from 'react-router-dom'
import { canLinkWrestler, wrestlerSearchPath } from '../utils/wrestler-link'

interface WrestlerLinkProps {
  name: string
  twId?: string
  floId?: string
  className?: string
}

export function WrestlerLink({
  name,
  twId,
  floId,
  className = 'wrestler-link',
}: WrestlerLinkProps) {
  if (!canLinkWrestler(name, twId, floId)) {
    return <span className={className}>{name}</span>
  }

  return (
    <Link to={wrestlerSearchPath(name, twId, floId)} className={className}>
      {name}
    </Link>
  )
}
