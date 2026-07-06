import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Accolade } from '../types/wrestler'
import { placementAccent, placementEmoji } from '../utils/placements'

interface TournamentsProps {
  accolades: Accolade[]
}

export function Tournaments({ accolades }: TournamentsProps) {
  const sorted = [...accolades].sort((a, b) => b.year - a.year)

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
      {sorted.map((accolade, index) => {
        const accent = placementAccent(accolade.placement, accolade.title)

        return (
          <Box
            key={`${accolade.title}-${accolade.year}-${index}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: '3.5rem 1fr',
              gap: 2,
              px: 2,
              py: 1.5,
              borderBottom: index < sorted.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              borderLeft: '4px solid',
              borderLeftColor: accent.border,
              bgcolor: accent.background,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, fontSize: '0.85rem' }}
            >
              {accolade.year}
            </Typography>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, lineHeight: 1.4, display: 'flex', gap: 0.75 }}
              >
                <Box component="span" aria-hidden="true">
                  {placementEmoji(accolade.placement, accolade.title)}
                </Box>
                {accolade.title}
              </Typography>
              {(accolade.event || accolade.placement) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25, fontSize: '0.85rem', lineHeight: 1.4 }}
                >
                  {[accolade.event, accolade.placement].filter(Boolean).join(' · ')}
                </Typography>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
