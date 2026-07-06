import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { WrestlerData } from '../types/wrestler'
import { computeHeadToHead } from '../utils/stats'
import { HeadToHead } from './HeadToHead'
import { MatchHistory } from './MatchHistory'
import { ProfileHeader } from './ProfileHeader'
import { Tabs } from './Tabs'
import { CareerTimeline } from './Timeline'
import { Tournaments } from './Tournaments'

interface WrestlerProfileViewProps {
  data: WrestlerData
}

function TabEmptyState({ message }: { message: string }) {
  return (
    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
      {message}
    </Typography>
  )
}

export function WrestlerProfileView({ data }: WrestlerProfileViewProps) {
  const [tab, setTab] = useState('timeline')

  const headToHead = useMemo(
    () => computeHeadToHead(data.matches),
    [data.matches],
  )

  const tabs = [
    { id: 'timeline', label: 'Timeline', count: data.timeline.length || undefined },
    {
      id: 'tournaments',
      label: 'Tournaments',
      count: data.accolades.length || undefined,
    },
    { id: 'matches', label: 'Matches', count: data.matches.length },
    { id: 'opponents', label: 'Opponents', count: headToHead.length || undefined },
  ]

  return (
    <Box className="app">
      <Box component="nav" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="text.secondary">
          ← Search
        </Link>
      </Box>

      <ProfileHeader profile={data.profile} />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <Box sx={{ pt: 2.5 }}>
        {tab === 'timeline' &&
          (data.timeline.length > 0 ? (
            <CareerTimeline timeline={data.timeline} />
          ) : (
            <TabEmptyState message="No timeline on file." />
          ))}

        {tab === 'tournaments' &&
          (data.accolades.length > 0 ? (
            <Tournaments accolades={data.accolades} />
          ) : (
            <TabEmptyState message="No tournaments on file." />
          ))}

        {tab === 'matches' && <MatchHistory matches={data.matches} />}

        {tab === 'opponents' &&
          (headToHead.length > 0 ? (
            <HeadToHead records={headToHead} />
          ) : (
            <TabEmptyState message="No opponent history on file." />
          ))}
      </Box>
    </Box>
  )
}
