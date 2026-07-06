import Box from '@mui/material/Box'
import { Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <SiteFooter />
    </Box>
  )
}
