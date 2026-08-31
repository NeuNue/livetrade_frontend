// 数字 / 时间格式化工具

const nf0 = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf4 = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 4 })

/** 整数千分位 */
export const fmtInt = (v) => nf0.format(Number(v) || 0)

/** 通用数字（最多 2 位小数） */
export const fmtNum = (v) => nf2.format(Number(v) || 0)

/** 金额 $1,234.56 */
export const fmtMoney = (v) => `$${nf2.format(Number(v) || 0)}`

/** 股价 $1,234.56 */
export const fmtPrice = (v) => `$${nf2.format(Number(v) || 0)}`

/** 股数（最多 4 位小数） */
export const fmtQty = (v) => nf4.format(Number(v) || 0)

/** 涨跌幅 +12.34% */
export const fmtPct = (v) => {
  const n = Number(v) || 0
  return `${n >= 0 ? '+' : ''}${nf2.format(n)}%`
}

/** 带符号金额（+/- 着色用） */
export const fmtSigned = (v) => {
  const n = Number(v) || 0
  return `${n >= 0 ? '+' : '-'}${fmtMoney(Math.abs(n))}`
}

const DAY = 86400
const HOUR = 3600
const MIN = 60

/** 相对时间：刚刚 / n 分钟前 / n 小时前 / n 天前 / 具体日期 */
export function timeAgo(ts) {
  if (!ts) return '—'
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - ts)
  if (diff < MIN) return '刚刚'
  if (diff < HOUR) return `${Math.floor(diff / MIN)} 分钟前`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`
  if (diff < DAY * 7) return `${Math.floor(diff / DAY)} 天前`
  return fmtDate(ts)
}

/** 完整时间：2026-08-31 17:53 */
export function fmtDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts * 1000)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 短 ID（open_id 取前 8 位） */
export const shortId = (id) => (id && id.length > 8 ? `${id.slice(0, 8)}…` : id || '—')

/** 数字压缩显示：1.2万 / 3.4亿 */
export function fmtCompact(v) {
  const n = Number(v) || 0
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${nf2.format(n / 1e8)}亿`
  if (abs >= 1e4) return `${nf2.format(n / 1e4)}万`
  return nf0.format(n)
}
