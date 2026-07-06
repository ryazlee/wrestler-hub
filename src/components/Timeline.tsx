import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { TimelineEntry } from '../types/wrestler'
import { formatBonusStats, formatRecord } from '../utils/stats'

interface TimelineProps {
  timeline: TimelineEntry[]
}

export function CareerTimeline({ timeline }: TimelineProps) {
  if (timeline.length === 0) return null

  const entries = [...timeline].sort((a, b) => b.year - a.year)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
        {entries.map((entry, index) => (
          <Box
            component="li"
            key={entry.year}
            sx={{
              display: 'grid',
              gridTemplateColumns: '3.5rem 1fr',
              gap: 2,
              px: 2,
              py: 1.5,
              borderBottom: index < entries.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              listStyle: 'none',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, fontSize: '0.85rem' }}
            >
              {entry.year}
            </Typography>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: 1.4 }}
              >
                {entry.team}
              </Typography>

              {(entry.record ||
                entry.season ||
                entry.falls != null ||
                entry.techs != null ||
                entry.majors != null) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25, fontSize: '0.85rem', lineHeight: 1.4 }}
                >
                  {entry.season && (
                    <>
                      {entry.season}
                      {entry.record && ' · '}
                    </>
                  )}
                  {entry.record && (
                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {formatRecord(entry.record)}
                    </Box>
                  )}
                  {(entry.falls != null ||
                    entry.techs != null ||
                    entry.majors != null) && (
                    <>
                      {(entry.season || entry.record) && ' · '}
                      {formatBonusStats(
                        entry.falls ?? 0,
                        entry.techs ?? 0,
                        entry.majors ?? 0,
                      )}
                    </>
                  )}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
    </Box>
  )
}
