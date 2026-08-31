/** 通用加载态（简约：旋转指示器） */
export function Loading({ text = '加载中…' }) {
  return (
    <div className="loading-wrap">
      <span className="spinner" aria-hidden="true" />
      <p className="loading-text">{text}</p>
    </div>
  )
}

/** 通用空状态 */
export function Empty({ emoji = '🌸', title = '暂无数据', desc = '' }) {
  return (
    <div className="empty-wrap">
      <span className="empty-emoji">{emoji}</span>
      <p className="empty-title">{title}</p>
      {desc ? <p className="empty-desc">{desc}</p> : null}
    </div>
  )
}
