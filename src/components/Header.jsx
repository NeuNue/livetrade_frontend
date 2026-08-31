import { Link, useLocation, useNavigate } from 'react-router-dom'
import Mascot from './Mascot.jsx'

/** 顶部导航：logo + 首页锚点导航（排行榜 / 操作动态）+ 数据新鲜度 */
export default function Header({ updatedAt }) {
  const navigate = useNavigate()
  const location = useLocation()

  const goAnchor = (id) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <Mascot size={46} />
          <span className="brand-text">
            <span className="brand-title">納指自習室</span>
            <span className="brand-sub">虚拟美股 · 弹幕交易研究所</span>
          </span>
        </Link>
        <nav className="nav-links">
          <button type="button" className="nav-link" onClick={() => goAnchor('rank')}>
            🏆 排行榜
          </button>
          <button type="button" className="nav-link" onClick={() => goAnchor('feed')}>
            💬 操作动态
          </button>
        </nav>
        {updatedAt ? (
          <span className="updated-badge" title={`数据更新时间：${updatedAt}`}>
            <span className="live-dot" />
            数据更新于 {updatedAt}
          </span>
        ) : null}
      </div>
    </header>
  )
}
