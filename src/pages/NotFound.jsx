import { Link } from 'react-router-dom'
import Mascot from '../components/Mascot.jsx'

export default function NotFound() {
  return (
    <div className="notfound">
      <Mascot size={130} className="bounce-soft" />
      <h1 className="notfound-title">404 · 迷路了？</h1>
      <p className="notfound-desc">这里没有页面，只有飘落的樱花。</p>
      <Link to="/" className="btn-primary">
        🌸 回到自习室
      </Link>
    </div>
  )
}
