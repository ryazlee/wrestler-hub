import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Tab from '@mui/material/Tab'
import MuiTabs from '@mui/material/Tabs'

export interface TabItem {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <MuiTabs
      value={active}
      onChange={(_, value) => onChange(value)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 44,
        '& .MuiTab-root': {
          minHeight: 44,
          textTransform: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
          color: 'text.secondary',
          px: 1.5,
          '&.Mui-selected': {
            color: 'text.primary',
          },
        },
        '& .MuiTabs-indicator': {
          backgroundColor: 'text.primary',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          disableRipple
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {tab.label}
              {tab.count !== undefined && (
                <Chip
                  label={tab.count}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: active === tab.id ? 'action.selected' : 'action.hover',
                    color: 'text.secondary',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              )}
            </Box>
          }
        />
      ))}
    </MuiTabs>
  )
}
