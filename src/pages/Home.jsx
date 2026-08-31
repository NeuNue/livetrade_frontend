import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { loadHome } from '../api.js'
import { fmtDate, fmtInt, fmtMoney, fmtQty, timeAgo } from '../format.js'
import { explainReason } from '../labels.js'
import Avatar from '../components/Avatar.jsx'
import Mascot from '../components/Mascot.jsx'
import TypeBadge from '../components/TypeBadge.jsx'
import { Empty, Loading } from '../components/State.jsx'

const REFRESH_MS = 60_000 // 与 vercel.json 的 data 缓存策略一致
const FEED_PAGE = 40

function StatChip({ label, value, accent = false }) {
  return (
    <div className={`stat-chip ${accent ? 'stat-chip-accent' : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function SectionTitle({ id, emoji, title, sub }) {
  return (
    <div className="section-title" id={id}>
      <h2>
        <span className="section-emoji">{emoji}</span>
        {title}
      </h2>
      {sub ? <p className="section-sub">{sub}</p> : null}
    </div>
  )
}

/* 前三名领奖台 */
function Podium({ top }) {
  const order = [top[1], top[0], top[2]].filter(Boolean)
  return (
    <div className="podium">
      {order.map((u) => (
        <Link
          key={u.open_id}
          to={`/player/${u.open_id}`}
          className={`podium-card podium-rank-${u.rank}`}
        >
          <span className="podium-medal">{u.rank === 1 ? '👑' : u.rank === 2 ? '🥈' : '🥉'}</span>
          <Avatar src={u.face} nickname={u.nickname} size={u.rank === 1 ? 84 : 64} />
          <span className="podium-name" title={u.nickname}>
            {u.nickname}
          </span>
          <span className="podium-total">{fmtMoney(u.total)}</span>
          <span className="podium-trades">交易 {u.trade_count} 次 · 持仓 {u.position_count}</span>
        </Link>
      ))}
    </div>
  )
}

/* 排行榜表格行 */
function RankRow({ u, maxTotal }) {
  const pct = maxTotal > 0 ? (u.total / maxTotal) * 100 : 0
  return (
    <Link to={`/player/${u.open_id}`} className="rank-row">
      <span className={`rank-no rank-no-${Math.min(u.rank, 4)}`}>{u.rank}</span>
      <span className="rank-player">
        <Avatar src={u.face} nickname={u.nickname} size={40} />
        <span className="rank-name-wrap">
          <span className="rank-name">{u.nickname}</span>
          <span className="rank-id">{u.open_id.slice(0, 8)}</span>
        </span>
      </span>
      <span className="rank-stat rank-hide-sm">{u.position_count} 只</span>
      <span className="rank-stat rank-hide-md">{u.trade_count} 次</span>
      <span className="rank-total">
        <span className="rank-total-num">{fmtMoney(u.total)}</span>
        <span className="rank-bar">
          <span className="rank-bar-fill" style={{ width: `${Math.max(4, pct)}%` }} />
        </span>
      </span>
      <span className="rank-stat rank-time">{timeAgo(u.last_active_at)}</span>
    </Link>
  )
}

/* 操作流单条 */
function FeedItem({ f }) {
  let text
  if (f.type === 'recharge') {
    text = (
      <>
        送出了 <b>{f.gift_name}</b> ×{f.gift_count} · 虚拟币
        <b className="up"> +{fmtInt(f.coins_added)}</b>
      </>
    )
  } else if (f.status === 'rejected') {
    text = (
      <>
        {f.symbol ? <b>${f.symbol}</b> : '操作'}
        <span className="feed-fail"> 失败 · {explainReason(f.reason)}</span>
      </>
    )
  } else if (f.type === 'buy') {
    text = (
      <>
        <b>${f.symbol}</b> {fmtQty(f.quantity)} 股 @ {fmtMoney(f.price)} · 花费
        <b> {fmtMoney(f.amount)}</b>
      </>
    )
  } else {
    text = (
      <>
        <b>${f.symbol}</b> {fmtQty(f.quantity)} 股 @ {fmtMoney(f.price)} · 回款
        <b> {fmtMoney(f.amount)}</b>
      </>
    )
  }
  return (
    <li className="feed-item">
      <span className="feed-avatar">
        <Avatar src={f.face} nickname={f.nickname} size={40} />
      </span>
      <span className="feed-body">
        <span className="feed-head">
          <Link to={`/player/${f.open_id}`} className="feed-name">
            {f.nickname}
          </Link>
          <TypeBadge type={f.type} status={f.status} compact />
          <time className="feed-time" title={fmtDate(f.ts)}>
            {timeAgo(f.ts)}
          </time>
        </span>
        <span className="feed-text">{text}</span>
      </span>
    </li>
  )
}

export default function Home() {
  const [state, setState] = useState({ loading: true, error: null, meta: null, leaderboard: [], feed: [] })
  const [feedCount, setFeedCount] = useState(FEED_PAGE)
  const location = useLocation()
  const scrollTarget = location.state?.scrollTo
  const didScroll = useRef(false)

  const load = async () => {
    try {
      const { meta, leaderboard, feed } = await loadHome()
      setState({ loading: false, error: null, meta, leaderboard, feed })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message || '加载失败' }))
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => clearInterval(t)
  }, [])

  // 从导航状态滚动到指定区块（排行榜/动态）
  useEffect(() => {
    if (scrollTarget && !didScroll.current && !state.loading) {
      didScroll.current = true
      const el = document.getElementById(scrollTarget)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
      }
    }
  }, [scrollTarget, state.loading])

  const { meta, leaderboard, feed, loading, error } = state
  const top = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const maxTotal = useMemo(
    () => Math.max(...leaderboard.map((u) => u.total), 1),
    [leaderboard],
  )
  const visibleFeed = feed.slice(0, feedCount)
  const updatedAt = meta ? fmtDate(meta.exported_at) : null
  const stats = meta?.stats || {}

  if (loading) return <Loading text="正在翻开花名册…" />
  if (error) {
    return (
      <Empty emoji="😿" title="数据加载失败" desc={`${error} — 请确认已运行 usstock-game 的导出脚本`} />
    )
  }

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">🌸 B站直播互动 · 虚拟美股交易</p>
          <h1 className="hero-title">
            納指自習室
            <span className="hero-title-dot">.</span>
          </h1>
          <p className="hero-sub">弹幕下单 · 实时撮合 · 全流水记账 —— 这里是大家的虚拟盘研究所</p>
          <div className="hero-stats">
            <StatChip label="玩家" value={fmtInt(stats.users)} />
            <StatChip label="累计成交" value={`${fmtInt(stats.trades)} 笔`} />
            <StatChip label="礼物入账" value={`${fmtInt(stats.recharges)} 次`} />
            <StatChip label="行情标的" value={`${fmtInt(stats.symbols_with_price)} 只`} accent />
          </div>
        </div>
        <div className="hero-mascot">
          <Mascot size={170} className="bounce-soft" />
          <span className="hero-mascot-note">今天也要元气满满地交易哦！</span>
        </div>
      </section>

      {/* 排行榜 */}
      <section className="section card" id="rank">
        <SectionTitle
          emoji="🏆"
          title="资产排行榜"
          sub={`现金 + 持仓市值（按最新行情），共 ${fmtInt(leaderboard.length)} 位玩家 · 点击玩家进入个人页`}
        />
        {top.length > 0 ? <Podium top={top} /> : null}
        <div className="rank-table">
          <div className="rank-row rank-head">
            <span>排名</span>
            <span>玩家</span>
            <span className="rank-hide-sm">持仓</span>
            <span className="rank-hide-md">交易</span>
            <span>总资产</span>
            <span className="rank-time">最近活跃</span>
          </div>
          {leaderboard.map((u) => (
            <RankRow key={u.open_id} u={u} maxTotal={maxTotal} />
          ))}
          {leaderboard.length === 0 ? <Empty emoji="🍵" title="还没有玩家" desc="开播后观众发 !buy 即可上榜" /> : null}
        </div>
      </section>

      {/* 操作动态 */}
      <section className="section card" id="feed">
        <SectionTitle
          emoji="💬"
          title="近期操作动态"
          sub={`全场合计 ${fmtInt(feed.length)} 条（成交 / 拒绝 / 礼物入账），每 60 秒自动刷新`}
        />
        {feed.length === 0 ? (
          <Empty emoji="🌸" title="暂无动态" desc="直播间弹幕指令会实时出现在这里" />
        ) : (
          <ul className="feed-list">
            {visibleFeed.map((f, i) => (
              <FeedItem key={`${f.ts}-${f.open_id}-${i}`} f={f} />
            ))}
          </ul>
        )}
        {feedCount < feed.length ? (
          <div className="more-wrap">
            <button type="button" className="btn-ghost" onClick={() => setFeedCount((c) => c + FEED_PAGE)}>
              查看更多动态 ↓
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
