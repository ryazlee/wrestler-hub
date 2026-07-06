import Box from '@mui/material/Box'
import type { CareerRecord } from '../types/wrestler'

export const WIN_COLOR = '#059669'
export const LOSS_COLOR = '#dc2626'
export const WIN_BG = '#ecfdf5'
export const LOSS_BG = '#fef2f2'

interface ColoredRecordProps {
  record: CareerRecord
  bold?: boolean
}

export function ColoredRecord({ record, bold = false }: ColoredRecordProps) {
  return (
    <>
      <Box
        component="span"
        sx={{ color: WIN_COLOR, fontWeight: bold ? 700 : 600 }}
      >
        {record.wins}
      </Box>
      <Box component="span" sx={{ color: 'text.secondary', mx: 0.35 }}>
        -
      </Box>
      <Box
        component="span"
        sx={{ color: LOSS_COLOR, fontWeight: bold ? 700 : 600 }}
      >
        {record.losses}
      </Box>
    </>
  )
}
