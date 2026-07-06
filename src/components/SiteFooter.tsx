import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: 2,
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Created by Ryan{' '}
        <Box component="span" aria-hidden>
          🐸
        </Box>{' '}
        <Link
          href="https://github.com/ryazlee"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          @ryazlee
        </Link>
      </Typography>
    </Box>
  )
}
