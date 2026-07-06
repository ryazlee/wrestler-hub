import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SearchPage } from './pages/SearchPage'
import { FloWrestlerPage, WrestlerPage } from './pages/WrestlerPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/wrestler/:twId" element={<WrestlerPage />} />
          <Route path="/flo/:floId" element={<FloWrestlerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
