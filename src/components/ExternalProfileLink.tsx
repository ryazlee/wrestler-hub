import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

type Platform = 'trackwrestling' | 'flowrestling'

const PLATFORM_NAMES: Record<Platform, string> = {
  trackwrestling: 'Trackwrestling',
  flowrestling: 'FloWrestling',
}

interface ExternalProfileLinkProps {
  platform: Platform
  url: string
  id: string
}

export function ExternalProfileLink({
  platform,
  url,
  id,
}: ExternalProfileLinkProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      underline="none"
      sx={{
        display: 'block',
        flex: '1 1 12rem',
        minWidth: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        px: 1.75,
        py: 1.25,
        color: 'text.primary',
        transition: 'border-color 0.15s ease',
        '&:hover': {
          borderColor: 'text.secondary',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {PLATFORM_NAMES[platform]}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.25, lineHeight: 1.3 }}
          >
            View profile
          </Typography>
        </Box>
        <Typography
          component="span"
          aria-hidden
          color="text.secondary"
          sx={{ fontSize: '0.9rem', lineHeight: 1, flexShrink: 0, mt: 0.125 }}
        >
          ↗
        </Typography>
      </Box>
      <Typography
        variant="caption"
        component="div"
        color="text.secondary"
        sx={{
          mt: 0.75,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.02em',
        }}
      >
        ID {id}
      </Typography>
    </Link>
  )
}
