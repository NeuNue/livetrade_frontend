import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="notfound">
      <span className="notfound-mark">🌸</span>
      <h1 className="notfound-title">404</h1>
      <p className="notfound-desc">页面不存在，或这位玩家还没有来过自习室。</p>
      <Link to="/" className="btn-primary">
        返回首页
      </Link>
    </div>
  )
}
