import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { HeadToHeadRecord } from '../types/wrestler'
import { displayOpponentSchool } from '../utils/stats'
import { WrestlerLink } from './WrestlerLink'

interface HeadToHeadProps {
  records: HeadToHeadRecord[]
}

const WIN_COLOR = '#059669'
const LOSS_COLOR = '#dc2626'

export function HeadToHead({ records }: HeadToHeadProps) {
  if (records.length === 0) {
    return (
      <Box component="section">
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No opponent records available yet.
        </Typography>
      </Box>
    )
  }

  return (
    <Box component="section">
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {records.map((record, index) => {
          const total = record.wins + record.losses
          const winning = record.wins >= record.losses
          const accentColor = winning ? WIN_COLOR : LOSS_COLOR
          const accentBg = winning ? '#ecfdf5' : '#fef2f2'
          const school = displayOpponentSchool(record.school)

          return (
            <Box
              key={`${record.opponent}-${record.school}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                borderBottom: index < records.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                borderLeft: '4px solid',
                borderLeftColor: accentColor,
                bgcolor: accentBg,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <WrestlerLink
                  name={record.opponent}
                  twId={record.opponentTwId}
                  floId={record.opponentFloId}
                  className="wrestler-link"
                />
                {school && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    {school}
                  </Typography>
                )}
              </Box>

              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  <Box component="span" sx={{ color: WIN_COLOR }}>
                    {record.wins}
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary', mx: 0.25 }}>
                    -
                  </Box>
                  <Box component="span" sx={{ color: LOSS_COLOR }}>
                    {record.losses}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {total} bouts
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
