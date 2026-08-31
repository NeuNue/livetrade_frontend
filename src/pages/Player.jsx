import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadPlayer } from '../api.js'
import { fmtDate, fmtInt, fmtMoney, fmtPct, fmtPrice, fmtQty, fmtSigned, shortId, timeAgo } from '../format.js'
import { explainReason } from '../labels.js'
import Avatar from '../components/Avatar.jsx'
import TypeBadge, { pnlClass } from '../components/TypeBadge.jsx'
import { Empty, Loading } from '../components/State.jsx'

const TRADE_PAGE = 40

function Stat({ label, value, cls = '' }) {
  return (
    <div className={`player-stat ${cls}`}>
      <span className="player-stat-label">{label}</span>
      <span className="player-stat-value">{value}</span>
    </div>
  )
}

export default function Player() {
  const { openId } = useParams()
  const [state, setState] = useState({ loading: true, notFound: false, data: null })
  const [tradeCount, setTradeCount] = useState(TRADE_PAGE)

  useEffect(() => {
    let alive = true
    setState({ loading: true, notFound: false, data: null })
    setTradeCount(TRADE_PAGE)
    loadPlayer(openId)
      .then((data) => alive && setState({ loading: false, data }))
      .catch((e) => alive && setState({ loading: false, notFound: e.status === 404, data: null }))
    return () => {
      alive = false
    }
  }, [openId])

  if (state.loading) return <Loading text="加载中…" />
  if (state.notFound || !state.data) {
    return <Empty emoji="😿" title="找不到这位玩家" desc="ta 可能还没来过自习室，或已经退场了" />
  }

  const { user, rank, total, cash, positions_value, unrealized_pnl, unrealized_pnl_pct, stats, positions, trades, recharges } =
    state.data
  const visibleTrades = trades.slice(0, tradeCount)
  const hasMoreTrades = tradeCount < trades.length

  return (
    <div className="player-page">
      <Link to="/" className="back-link">
        ← 返回
      </Link>

      {/* 档案卡 */}
      <section className="card profile-card">
        <div className="profile-main">
          <Avatar src={user.face} nickname={user.nickname} size={64} />
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{user.nickname}</h1>
              {user.is_member ? <span className="member-badge">舰长</span> : null}
              {rank ? <span className="rank-badge">第 {rank} 名</span> : <span className="rank-badge rank-badge-off">未上榜</span>}
            </div>
            <p className="profile-id">
              ID {shortId(user.open_id)} · 加入于 {fmtDate(user.created_at)}
              {stats.last_active_at ? ` · 最近活跃 ${timeAgo(stats.last_active_at)}` : ''}
            </p>
            <p className="profile-total-label">总资产（现金 + 持仓市值）</p>
            <p className="profile-total">{fmtMoney(total)}</p>
          </div>
        </div>
        <div className="profile-stats">
          <Stat label="可用现金" value={fmtMoney(cash)} />
          <Stat label="持仓市值" value={fmtMoney(positions_value)} />
          <Stat label="浮动盈亏" value={fmtSigned(unrealized_pnl)} cls={`num-${pnlClass(unrealized_pnl)}`} />
          <Stat label="盈亏率" value={fmtPct(unrealized_pnl_pct)} cls={`num-${pnlClass(unrealized_pnl_pct)}`} />
          <Stat label="累计交易" value={`${fmtInt(stats.trade_count)} 次`} />
          <Stat label="累计手续费" value={fmtMoney(stats.total_fees)} />
          {stats.recharge_count > 0 ? <Stat label="礼物入账" value={`${fmtInt(stats.recharge_count)} 次`} /> : null}
          <Stat label="持仓标的" value={`${positions.length} 只`} />
        </div>
      </section>

      {/* 当前持仓 */}
      <section className="section card">
        <h2 className="section-h2">当前持仓</h2>
        {positions.length === 0 ? (
          <Empty emoji="🍃" title="空仓中" desc="这位玩家还没有持仓" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>标的</th>
                  <th>数量</th>
                  <th>成本价</th>
                  <th>现价</th>
                  <th>市值</th>
                  <th>浮动盈亏</th>
                  <th>盈亏率</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.symbol}>
                    <td>
                      <span className="symbol-chip">${p.symbol}</span>
                    </td>
                    <td>{fmtQty(p.quantity)}</td>
                    <td>{fmtPrice(p.avg_cost)}</td>
                    <td>
                      {fmtPrice(p.current_price)}
                      {p.price_ts ? <span className="cell-note">· {timeAgo(p.price_ts)}</span> : null}
                    </td>
                    <td>{fmtMoney(p.market_value)}</td>
                    <td className={`num-${pnlClass(p.pnl)}`}>{fmtSigned(p.pnl)}</td>
                    <td className={`num-${pnlClass(p.pnl_pct)}`}>{fmtPct(p.pnl_pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 历史操作 */}
      <section className="section card">
        <h2 className="section-h2">历史操作</h2>
        {trades.length === 0 ? (
          <Empty emoji="📭" title="暂无交易记录" desc="买入 / 卖出指令都会记录在这里" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>方向</th>
                    <th>标的</th>
                    <th>数量</th>
                    <th>价格</th>
                    <th>金额</th>
                    <th>手续费</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTrades.map((t) => (
                    <tr key={`${t.ts}-${t.side}-${t.symbol}-${t.quantity}`} className={t.status === 'rejected' ? 'row-rejected' : ''}>
                      <td className="cell-time" title={fmtDate(t.ts)}>
                        {timeAgo(t.ts)}
                      </td>
                      <td>
                        <TypeBadge type={t.side} status={t.status} compact />
                      </td>
                      <td>{t.symbol ? <span className="symbol-chip">${t.symbol}</span> : '—'}</td>
                      <td>{t.quantity ? fmtQty(t.quantity) : '—'}</td>
                      <td>{t.price ? fmtPrice(t.price) : '—'}</td>
                      <td>{t.amount ? fmtMoney(t.amount) : '—'}</td>
                      <td>{t.fee ? fmtMoney(t.fee) : '—'}</td>
                      <td>
                        {t.status === 'rejected' ? (
                          <span className="reject-reason" title={`拒绝原因：${t.reason}`}>
                            {explainReason(t.reason)}
                          </span>
                        ) : (
                          <span className="ok-text">成交</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMoreTrades ? (
              <div className="more-wrap">
                <button type="button" className="btn-ghost" onClick={() => setTradeCount((c) => c + TRADE_PAGE)}>
                  加载更多（剩余 {trades.length - tradeCount} 条）
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* 礼物充值 */}
      {recharges.length > 0 ? (
        <section className="section card">
          <h2 className="section-h2">礼物入账</h2>
          <ul className="recharge-list">
            {recharges.map((r, i) => (
              <li key={i} className="recharge-item">
                <span className="recharge-gift">
                  {r.gift_name} ×{r.gift_count}
                </span>
                <span className="recharge-coins up">虚拟币 +{fmtInt(r.coins_added)}</span>
                <time className="recharge-time" title={fmtDate(r.ts)}>
                  {timeAgo(r.ts)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
