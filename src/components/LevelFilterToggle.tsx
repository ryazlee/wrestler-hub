import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import {
  LEVEL_FILTER_OPTIONS,
  type LevelFilter,
} from '../utils/level'

interface LevelFilterToggleProps {
  value: LevelFilter
  onChange: (value: LevelFilter) => void
  showCollege?: boolean
}

export function LevelFilterToggle({
  value,
  onChange,
  showCollege = true,
}: LevelFilterToggleProps) {
  const options = showCollege
    ? LEVEL_FILTER_OPTIONS
    : LEVEL_FILTER_OPTIONS.filter((option) => option.id !== 'college')

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mb: 0.75,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Career level
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            size="small"
            onClick={() => onChange(option.id)}
            variant={value === option.id ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 500,
              ...(value === option.id
                ? { bgcolor: 'text.primary', color: 'background.paper' }
                : {}),
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
