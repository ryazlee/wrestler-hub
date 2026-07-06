import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SearchResult } from '../types/wrestler'

export { getSearchOptionKey, getSearchOptionLabel } from '../utils/search'

interface SearchResultOptionProps {
  option: SearchResult
  optionProps: React.HTMLAttributes<HTMLLIElement>
}

export function SearchResultOption({ option, optionProps }: SearchResultOptionProps) {
  const subtitle = [
    option.weightClass ? `${option.weightClass} lbs` : null,
    `${option.hometown}, ${option.state}`,
    option.matchType === 'city' ? 'City match' : null,
    option.floId ? 'Flo profile' : 'Trackwrestling only',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Box
      component="li"
      {...optionProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        px: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
          {option.firstName} {option.lastName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  )
}
