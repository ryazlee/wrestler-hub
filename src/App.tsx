import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SearchPage } from './pages/SearchPage'
import { WrestlerPage } from './pages/WrestlerPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function FloLegacyRedirect() {
  const { floId } = useParams<{ floId: string }>()
  return <Navigate to={`/wrestler/${floId ?? ''}`} replace />
}

function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/wrestler/:id" element={<WrestlerPage />} />
          <Route path="/flo/:floId" element={<FloLegacyRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
