import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        },
      },
    },
  },
})
