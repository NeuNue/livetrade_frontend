// 静态 JSON 数据访问层：所有数据来自 public/data/*.json（由 usstock-game/export_web.py 导出）

const BASE = import.meta.env.BASE_URL || '/'

async function fetchJson(path, { cache = 'no-store', timeout = 8000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(BASE + path, { cache, signal: ctrl.signal })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} ${path}`)
      err.status = res.status
      throw err
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** 首页数据：meta + 排行榜 + 操作流 */
export function loadHome() {
  return Promise.all([
    fetchJson('data/meta.json'),
    fetchJson('data/leaderboard.json'),
    fetchJson('data/feed.json'),
  ]).then(([meta, leaderboard, feed]) => ({ meta, leaderboard, feed }))
}

/** 仅元数据（顶栏数据更新时间用） */
export function loadMeta() {
  return fetchJson('data/meta.json')
}

/** 个人档案 */
export function loadPlayer(openId) {
  return fetchJson(`data/users/${encodeURIComponent(openId)}.json`)
}
