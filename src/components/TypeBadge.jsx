/** 操作类型徽章（简约文本样式） */
export default function TypeBadge({ type, status = 'filled', compact = false }) {
  const cls = `badge badge-${status === 'rejected' ? 'rejected' : type}${compact ? ' badge-compact' : ''}`
  if (status === 'rejected') return <span className={cls}>失败</span>
  if (type === 'buy') return <span className={cls}>买入</span>
  if (type === 'sell') return <span className={cls}>卖出</span>
  if (type === 'recharge') return <span className={cls}>礼物</span>
  return <span className={cls}>查询</span>
}

/** 数字着色：盈利红 / 亏损绿（A股习惯） */
export function pnlClass(v) {
  const n = Number(v) || 0
  return n > 0 ? 'up' : n < 0 ? 'down' : 'flat'
}
