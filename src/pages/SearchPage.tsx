import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { search } from '../api/client'
import {
  SearchResultOption,
  getSearchOptionKey,
  getSearchOptionLabel,
} from '../components/SearchResultOption'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { SearchResult } from '../types/wrestler'

export function SearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [options, setOptions] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const debouncedQuery = useDebouncedValue(query, 300)

  const fetchOptions = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 3) {
      setOptions([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await search(trimmed)
      setOptions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    if (trimmed.length >= 3) {
      setSearchParams({ q: trimmed }, { replace: true })
      setOpen(true)
      fetchOptions(trimmed)
      return
    }

    setSearchParams({}, { replace: true })
    setOptions([])
    setError(null)
    setOpen(false)
  }, [debouncedQuery, fetchOptions, setSearchParams])

  function handleSelect(option: SearchResult | null) {
    if (!option) return

    const name = `${option.firstName} ${option.lastName}`.trim()
    setQuery(name)
    setSearchParams({ q: name })
    navigate(`/wrestler/${option.twId}`)
  }

  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: 'auto',
        px: 2,
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          Wrestler Hub
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Search wrestlers by name or city.
        </Typography>
      </Box>

      <Autocomplete
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={(_, reason) => {
          if (reason === 'createOption') return
          setOpen(false)
        }}
        options={options}
        loading={loading}
        inputValue={query}
        onInputChange={(_, value, reason) => {
          if (reason === 'input' || reason === 'clear') {
            setQuery(value)
          }
        }}
        onChange={(_, value) => {
          if (value && typeof value !== 'string') {
            handleSelect(value)
          }
        }}
        getOptionLabel={getSearchOptionLabel}
        getOptionKey={getSearchOptionKey}
        isOptionEqualToValue={(option, value) =>
          typeof option !== 'string' &&
          typeof value !== 'string' &&
          getSearchOptionKey(option) === getSearchOptionKey(value)
        }
        filterOptions={(x) => x}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            },
          },
          listbox: {
            sx: {
              p: 0,
              maxHeight: 420,
            },
          },
        }}
        noOptionsText={
          debouncedQuery.trim().length < 3
            ? 'Type at least 3 characters'
            : loading
              ? 'Searching…'
              : 'No results found'
        }
        renderOption={(props, option) => {
          const { key: _optionKey, ...optionProps } = props

          if (typeof option === 'string') {
            return (
              <Box component="li" key={option} {...optionProps} sx={{ py: 1.25, px: 2 }}>
                <Typography variant="body2">{option}</Typography>
              </Box>
            )
          }

          return (
            <SearchResultOption
              key={getSearchOptionKey(option)}
              option={option}
              optionProps={optionProps}
            />
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Wrestler name or city"
            autoFocus
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : null}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}
