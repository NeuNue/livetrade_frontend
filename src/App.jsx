import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Player from './pages/Player.jsx'
import NotFound from './pages/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { loadMeta } from './api.js'
import { fmtDate } from './format.js'

const META_REFRESH_MS = 60_000

function initialTheme() {
  // 优先用户手动选择（localStorage），否则跟随系统
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || ''
  if (saved === 'light' || saved === 'dark') return saved
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export default function App() {
  const [updatedAt, setUpdatedAt] = useState(null)
  const [theme, setTheme] = useState(initialTheme)

  // 应用到 <html data-theme>，并持久化
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* 隐私模式等场景忽略 */
    }
  }, [theme])

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
      <Header updatedAt={updatedAt} theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      <main className="app-main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player/:openId" element={<Player />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
