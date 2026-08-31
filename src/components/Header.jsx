import { Link, useLocation, useNavigate } from 'react-router-dom'

/** 顶部导航：简约 —— 品牌 + 锚点导航 + 数据更新时间 */
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
          <span className="brand-mark">🌸</span>
          <span className="brand-text">
            <span className="brand-title">納指自習室</span>
            <span className="brand-sub">虚拟美股 · 弹幕交易</span>
          </span>
        </Link>
        <nav className="nav-links">
          <button type="button" className="nav-link" onClick={() => goAnchor('rank')}>
            排行榜
          </button>
          <button type="button" className="nav-link" onClick={() => goAnchor('feed')}>
            操作动态
          </button>
        </nav>
        {updatedAt ? (
          <span className="updated-badge" title={`数据更新时间：${updatedAt}`}>
            <span className="live-dot" />
            {updatedAt}
          </span>
        ) : null}
      </div>
    </header>
  )
}
