import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Player from './pages/Player.jsx'
import NotFound from './pages/NotFound.jsx'
import { loadMeta } from './api.js'
import { fmtDate } from './format.js'

const META_REFRESH_MS = 60_000

export default function App() {
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const meta = await loadMeta()
        if (alive) setUpdatedAt(fmtDate(meta.exported_at))
      } catch {
        /* 数据未就绪时静默 */
      }
    }
    load()
    const t = setInterval(load, META_REFRESH_MS)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  return (
    <div className="app-shell">
      <Header updatedAt={updatedAt} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player/:openId" element={<Player />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
