import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { WrestlerData } from '../types/wrestler'
import {
  filterAccolades,
  filterMatches,
  filterTimeline,
  hasCollegeData,
  profileForLevel,
  type LevelFilter,
} from '../utils/level'
import { computeHeadToHead } from '../utils/stats'
import { HeadToHead } from './HeadToHead'
import { LevelFilterToggle } from './LevelFilterToggle'
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
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')

  const hasCollege = useMemo(() => hasCollegeData(data), [data])

  const timeline = useMemo(
    () => filterTimeline(data.timeline, levelFilter),
    [data.timeline, levelFilter],
  )
  const accolades = useMemo(
    () => filterAccolades(data.accolades, levelFilter),
    [data.accolades, levelFilter],
  )
  const matches = useMemo(
    () => filterMatches(data.matches, levelFilter),
    [data.matches, levelFilter],
  )

  const headToHead = useMemo(() => computeHeadToHead(matches), [matches])

  const displayProfile = useMemo(
    () => profileForLevel(data.profile, data.timeline, data.matches, levelFilter),
    [data.profile, data.timeline, data.matches, levelFilter],
  )

  const tabs = [
    { id: 'timeline', label: 'Timeline', count: timeline.length || undefined },
    {
      id: 'tournaments',
      label: 'Tournaments',
      count: accolades.length || undefined,
    },
    { id: 'matches', label: 'Matches', count: matches.length },
    { id: 'opponents', label: 'Opponents', count: headToHead.length || undefined },
  ]

  return (
    <Box className="app">
      <Box component="nav" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="text.secondary">
          ← Search
        </Link>
      </Box>

      <LevelFilterToggle
        value={levelFilter}
        onChange={setLevelFilter}
        showCollege={hasCollege}
      />

      <ProfileHeader profile={displayProfile} />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <Box sx={{ pt: 2.5 }}>
        {tab === 'timeline' &&
          (timeline.length > 0 ? (
            <CareerTimeline timeline={timeline} />
          ) : (
            <TabEmptyState message="No timeline on file for this level." />
          ))}

        {tab === 'tournaments' &&
          (accolades.length > 0 ? (
            <Tournaments accolades={accolades} />
          ) : (
            <TabEmptyState message="No tournaments on file for this level." />
          ))}

        {tab === 'matches' && <MatchHistory matches={matches} />}

        {tab === 'opponents' &&
          (headToHead.length > 0 ? (
            <HeadToHead records={headToHead} />
          ) : (
            <TabEmptyState message="No opponent history on file for this level." />
          ))}
      </Box>
    </Box>
  )
}
