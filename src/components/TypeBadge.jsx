/** 操作类型徽章：买入 / 卖出 / 礼物 / 失败 */
export default function TypeBadge({ type, status = 'filled', compact = false }) {
  if (status === 'rejected') {
    return <span className={`badge badge-rejected ${compact ? 'badge-compact' : ''}`}>✕ 失败</span>
  }
  if (type === 'buy') return <span className={`badge badge-buy ${compact ? 'badge-compact' : ''}`}>📈 买入</span>
  if (type === 'sell') return <span className={`badge badge-sell ${compact ? 'badge-compact' : ''}`}>📉 卖出</span>
  if (type === 'recharge') return <span className={`badge badge-recharge ${compact ? 'badge-compact' : ''}`}>🎁 礼物</span>
  return <span className={`badge badge-query ${compact ? 'badge-compact' : ''}`}>💬 查询</span>
}

/** 数字着色：盈利红 / 亏损绿（A股习惯） */
export function pnlClass(v) {
  const n = Number(v) || 0
  return n > 0 ? 'up' : n < 0 ? 'down' : 'flat'
}
