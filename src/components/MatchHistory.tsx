import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { Match } from '../types/wrestler'
import { formatDate, formatResult } from '../utils/stats'
import { WrestlerLink } from './WrestlerLink'

interface MatchHistoryProps {
  matches: Match[]
}

const WIN_COLOR = '#059669'
const WIN_BG = '#ecfdf5'
const LOSS_COLOR = '#dc2626'
const LOSS_BG = '#fef2f2'

export function MatchHistory({ matches }: MatchHistoryProps) {
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState<'all' | 'W' | 'L'>('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return [...matches]
      .filter((match) => {
        if (resultFilter === 'W' && match.result !== 'W') return false
        if (resultFilter === 'L' && match.result !== 'L') return false
        if (!query) return true

        return (
          match.opponent.toLowerCase().includes(query) ||
          match.opponentSchool.toLowerCase().includes(query) ||
          match.event.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [matches, search, resultFilter])

  return (
    <Box component="section">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1 }}>
        <TextField
          size="small"
          placeholder="Search matches…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {([
            ['all', 'All', undefined],
            ['W', 'Wins', WIN_COLOR],
            ['L', 'Losses', LOSS_COLOR],
          ] as const).map(([value, label, color]) => (
            <Chip
              key={value}
              label={label}
              size="small"
              onClick={() => setResultFilter(value)}
              variant={resultFilter === value ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 500,
                ...(resultFilter === value && color
                  ? {
                      bgcolor: value === 'W' ? WIN_BG : LOSS_BG,
                      color,
                      borderColor: color,
                    }
                  : resultFilter === value
                    ? { bgcolor: 'text.primary', color: 'background.paper' }
                    : {}),
              }}
            />
          ))}
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {filtered.length} of {matches.length} matches
      </Typography>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {filtered.map((match, index) => {
          const isWin = match.result === 'W'
          const isLoss = match.result === 'L'
          const accentColor = isWin ? WIN_COLOR : isLoss ? LOSS_COLOR : '#9ca3af'
          const accentBg = isWin ? WIN_BG : isLoss ? LOSS_BG : '#f9fafb'

          return (
            <Box
              key={`${match.date}-${match.opponent}-${index}`}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: index < filtered.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                borderLeft: '4px solid',
                borderLeftColor: accentColor,
                bgcolor: accentBg,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {formatDate(match.date)}
                </Typography>
                {match.weight && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {match.weight} lbs
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                <WrestlerLink
                  name={match.opponent}
                  twId={match.opponentTwId}
                  floId={match.opponentFloId}
                />
                {match.opponentSchool && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    {' '}
                    · {match.opponentSchool}
                  </Typography>
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25, fontSize: '0.85rem' }}
              >
                {formatResult(match)} · {match.event}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No matches found.
        </Typography>
      )}
    </Box>
  )
}
