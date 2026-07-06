import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SearchPage } from './pages/SearchPage'
import { FloWrestlerPage, WrestlerPage } from './pages/WrestlerPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/wrestler/:twId" element={<WrestlerPage />} />
        <Route path="/flo/:floId" element={<FloWrestlerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
