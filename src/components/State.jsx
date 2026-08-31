import Mascot from './Mascot.jsx'

/** 通用加载态（日系风格） */
export function Loading({ text = '数据加载中…' }) {
  return (
    <div className="loading-wrap">
      <Mascot size={96} className="bounce-soft" />
      <p className="loading-text">{text}</p>
    </div>
  )
}

/** 通用空状态 */
export function Empty({ emoji = '🌸', title = '空空如也', desc = '' }) {
  return (
    <div className="empty-wrap">
      <span className="empty-emoji">{emoji}</span>
      <p className="empty-title">{title}</p>
      {desc ? <p className="empty-desc">{desc}</p> : null}
    </div>
  )
}
