import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { WrestlerProfile } from '../types/wrestler'
import { winMethodPercentage, winPercentage } from '../utils/stats'
import { ColoredRecord } from './ColoredRecord'
import { ExternalProfileLink } from './ExternalProfileLink'

interface ProfileHeaderProps {
  profile: WrestlerProfile
}

interface ExternalIdLink {
  platform: 'trackwrestling' | 'flowrestling'
  id: string
  url: string
}

function externalIdLinks(profile: WrestlerProfile): ExternalIdLink[] {
  const links: ExternalIdLink[] = []

  if (profile.floId) {
    links.push({
      platform: 'flowrestling',
      id: profile.floId,
      url:
        profile.flowrestlingUrl ??
        `https://www.flowrestling.org/nextgen/people/${profile.floId}`,
    })
  }

  if (profile.twId) {
    links.push({
      platform: 'trackwrestling',
      id: profile.twId,
      url:
        profile.trackwrestlingUrl ??
        `https://www.trackwrestling.com/tw/membership/ViewProfile.jsp?twId=${profile.twId}`,
    })
  }

  return links
}

function StatCell({
  value,
  label,
  detail,
  showDivider,
}: {
  value: string | number
  label: string
  detail?: string
  showDivider?: boolean
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        textAlign: 'center',
        borderRight: showDivider ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.25 }}
      >
        {label}
      </Typography>
      {detail && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.125, fontSize: '0.7rem', opacity: 0.85 }}
        >
          {detail}
        </Typography>
      )}
    </Box>
  )
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const pct = winPercentage(profile.careerRecord)
  const wins = profile.careerRecord.wins
  const falls = profile.pins ?? 0
  const techs = profile.techs ?? 0
  const majors = profile.majors ?? 0

  const meta = [
    profile.school !== '—' ? profile.school : null,
    profile.weightClass !== '—' ? profile.weightClass : null,
    profile.hometown,
  ].filter(Boolean)

  const hasBonus =
    profile.pins !== undefined ||
    profile.techs !== undefined ||
    profile.majors !== undefined

  const idLinks = externalIdLinks(profile)

  return (
    <Box component="header" sx={{ mb: 4 }}>
      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2, mb: 0.5 }}
      >
        {profile.name}
      </Typography>

      {meta.length > 0 && (
        <Typography color="text.secondary" sx={{ mb: 2.5, fontSize: '0.95rem' }}>
          {meta.join(' · ')}
        </Typography>
      )}

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              textAlign: 'center',
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}
            >
              <ColoredRecord record={profile.careerRecord} />
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.25 }}
            >
              Record
            </Typography>
          </Box>
          <StatCell value={`${pct}%`} label="Win rate" />
        </Box>

        {hasBonus && wins > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <StatCell
              value={`${winMethodPercentage(falls, wins)}%`}
              label="Fall %"
              detail={falls > 0 ? `${falls} wins` : undefined}
              showDivider
            />
            <StatCell
              value={`${winMethodPercentage(techs, wins)}%`}
              label="Tech fall %"
              detail={techs > 0 ? `${techs} wins` : undefined}
              showDivider
            />
            <StatCell
              value={`${winMethodPercentage(majors, wins)}%`}
              label="Decision %"
              detail={majors > 0 ? `${majors} wins` : undefined}
            />
          </Box>
        )}
      </Box>

      {idLinks.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            flexWrap: 'wrap',
            mt: 2,
          }}
        >
          {idLinks.map((link) => (
            <ExternalProfileLink
              key={link.url}
              platform={link.platform}
              url={link.url}
              id={link.id}
            />
          ))}
        </Box>
      )}

      {profile.statsNote && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1.5, fontSize: '0.8rem', lineHeight: 1.4 }}
        >
          {profile.statsNote}
        </Typography>
      )}
    </Box>
  )
}
