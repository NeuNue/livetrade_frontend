import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { fmtMoney, fmtPct, fmtSigned } from '../format.js'

/**
 * 资产收益曲线（累计总资产 · 按日）
 *
 * 数据：daily = [{ day, total, profit, profit_pct }, ...]（升序，导出层已剔除礼物充入）
 * 渲染：绿=盈利 / 红=亏损，以 100 万初始资金为盈亏零轴（虚线基准），
 *       曲线与零轴围合的面积用渐变 + 高斯模糊虚化区分盈/亏区间。
 */
const BASE = 1_000_000
const H = 250
const PAD = { top: 18, right: 18, bottom: 30, left: 62 }

function yMoney(v) {
  const trim = (s) => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
  if (v >= 1e8) return `${trim((v / 1e8).toFixed(2))}亿`
  if (v >= 1e4) return `${trim((v / 1e4).toFixed(v >= 1e6 ? 0 : 1))}万`
  return String(Math.round(v))
}

function niceTicks(min, max, count = 4) {
  const span = max - min
  if (span <= 0) return [min]
  const step0 = span / Math.max(1, count - 1)
  const mag = 10 ** Math.floor(Math.log10(step0))
  const norm = step0 / mag
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag
  const out = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(v)
  return out.length ? out : [min]
}

export default function EquityCurve({ daily }) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const [w, setW] = useState(0)
  const [hover, setHover] = useState(-1)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  const n = Array.isArray(daily) ? daily.length : 0

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const geo = useMemo(() => {
    if (n < 2 || w <= 0) return null
    const vals = daily.map((d) => d.total)
    let lo = Math.min(BASE, ...vals)
    let hi = Math.max(BASE, ...vals)
    const pad = Math.max((hi - lo) * 0.14, BASE * 0.004, 1)
    lo -= pad
    hi += pad
    const plotW = Math.max(10, w - PAD.left - PAD.right)
    const plotH = H - PAD.top - PAD.bottom
    const px = (i) => PAD.left + (i / (n - 1)) * plotW
    const py = (v) => PAD.top + ((hi - v) / (hi - lo)) * plotH
    const yBase = py(BASE)
    const pts = daily.map((d, i) => ({ ...d, i, x: px(i), y: py(d.total) }))

    // 折线与零轴的交点插值 → 切出盈/亏连续段
    const full = [pts[0]]
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      if ((a.total >= BASE) !== (b.total >= BASE)) {
        const t = (BASE - a.total) / (b.total - a.total)
        full.push({ ...a, x: a.x + t * (b.x - a.x), y: yBase, total: BASE })
      }
      full.push(b)
    }
    const runs = []
    for (const p of full) {
      const k = p.total >= BASE ? 'up' : 'down'
      const last = runs[runs.length - 1]
      if (last && last.k === k) last.pts.push(p)
      else runs.push({ k, pts: [p] })
    }
    const area = []
    const line = []
    for (const r of runs) {
      if (r.pts.length < 2) continue
      const p0 = r.pts[0]
      const pn = r.pts[r.pts.length - 1]
      const poly = r.pts.map((p) => `${p.x} ${p.y}`).join(' L ')
      area.push({ k: r.k, d: `M ${p0.x} ${yBase} L ${poly} L ${pn.x} ${yBase} Z` })
      line.push({ k: r.k, d: `M ${poly}` })
    }
    return { pts, runs, area, line, yBase, lo, hi, plotW, plotH }
  }, [daily, n, w])

  if (n < 2) {
    return (
      <div className="equity-curve" ref={wrapRef}>
        <p className="equity-note">暂无足够数据绘制资产曲线</p>
      </div>
    )
  }
  if (!geo) {
    // 首次渲染宽度尚未测量：先占位，ResizeObserver 就绪后立即绘制
    return <div className="equity-curve" ref={wrapRef} style={{ minHeight: H }} />
  }

  const stepIdx = Math.max(1, Math.ceil(n / 6))
  const xTicks = []
  for (let i = 0; i < n; i += stepIdx) xTicks.push(i)
  if (xTicks[xTicks.length - 1] !== n - 1) xTicks.push(n - 1)

  const hovered = hover >= 0 && hover < n ? geo.pts[hover] : null

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const idx = Math.round((x - PAD.left) / (geo.plotW / (n - 1)))
    setHover(Math.max(0, Math.min(n - 1, idx)))
  }

  return (
    <div className="equity-curve" ref={wrapRef}>
      <div className="equity-legend">
        <span>
          <i className="legend-swatch" style={{ background: 'var(--up)' }} />
          盈利（总资产 &gt; 100 万）
        </span>
        <span>
          <i className="legend-swatch" style={{ background: 'var(--down)' }} />
          亏损（总资产 &lt; 100 万）
        </span>
      </div>

      <div className="equity-chart-wrap">
        <svg
          ref={svgRef}
          width={w}
          height={H}
          role="img"
          aria-label="每日资产收益曲线"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(-1)}
        >
          <defs>
            <linearGradient id={`${uid}-up-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--up)', stopOpacity: 0.36 }} />
              <stop offset="100%" style={{ stopColor: 'var(--up)', stopOpacity: 0.03 }} />
            </linearGradient>
            <linearGradient id={`${uid}-down-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--down)', stopOpacity: 0.36 }} />
              <stop offset="100%" style={{ stopColor: 'var(--down)', stopOpacity: 0.03 }} />
            </linearGradient>
            <filter id={`${uid}-soft`} x="-12%" y="-12%" width="124%" height="124%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>

          {/* Y 网格与刻度 */}
          {niceTicks(geo.lo, geo.hi, 4).map((t, i) => (
            <g key={`y${i}`}>
              <line
                x1={PAD.left}
                x2={PAD.left + geo.plotW}
                y1={geo.py(t)}
                y2={geo.py(t)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={geo.py(t) + 3}
                textAnchor="end"
                fontSize={10}
                style={{ fill: 'var(--text-3)' }}
              >
                {yMoney(t)}
              </text>
            </g>
          ))}

          {/* 100 万零轴基准线 */}
          <line
            x1={PAD.left}
            x2={PAD.left + geo.plotW}
            y1={geo.yBase}
            y2={geo.yBase}
            stroke="var(--text-3)"
            strokeWidth={1}
            strokeDasharray="5 4"
          />
          <text
            x={PAD.left + geo.plotW}
            y={Math.max(PAD.top + 10, geo.yBase - 6)}
            textAnchor="end"
            fontSize={10}
            style={{ fill: 'var(--text-3)' }}
          >
            100 万基准
          </text>

          {/* 与零轴围合的面积（渐变 + 虚化） */}
          {geo.area.map((a, i) => (
            <path
              key={`a${i}`}
              d={a.d}
              style={{
                fill: a.k === 'up' ? `url(#${uid}-up-fill)` : `url(#${uid}-down-fill)`,
                filter: `url(#${uid}-soft)`,
              }}
            />
          ))}

          {/* 主折线（按盈/亏分段着色） */}
          {geo.line.map((l, i) => (
            <path
              key={`l${i}`}
              d={l.d}
              fill="none"
              strokeWidth={2}
              style={{
                stroke: l.k === 'up' ? 'var(--up)' : 'var(--down)',
                strokeLinejoin: 'round',
                strokeLinecap: 'round',
              }}
            />
          ))}

          {/* X 轴日期 */}
          {xTicks.map((i) => (
            <text
              key={`x${i}`}
              x={geo.pts[i].x}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              style={{ fill: 'var(--text-3)' }}
            >
              {geo.pts[i].day.slice(5)}
            </text>
          ))}

          {/* 数据点（最后一日加粗） */}
          {n <= 48 &&
            geo.pts.map((p) => (
              <circle
                key={p.i}
                cx={p.x}
                cy={p.y}
                r={p.i === n - 1 ? 4.5 : 2.4}
                style={{ fill: p.total >= BASE ? 'var(--up)' : 'var(--down)' }}
              />
            ))}

          {/* 悬停指示 */}
          {hovered && (
            <g>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="var(--border-strong)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={hovered.x}
                cy={hovered.y}
                r={4.5}
                style={{
                  fill: 'var(--surface)',
                  stroke: hovered.total >= BASE ? 'var(--up)' : 'var(--down)',
                  strokeWidth: 2,
                }}
              />
            </g>
          )}
        </svg>

        {hovered && (
          <div
            className={`curve-tip ${hovered.y < 52 ? 'curve-tip-below' : ''}`}
            style={{ left: Math.min(Math.max(hovered.x, 92), w - 92), top: hovered.y }}
          >
            <div className="curve-tip-title">{hovered.day} 收盘</div>
            <div className="curve-tip-row">
              总资产 <b>{fmtMoney(hovered.total)}</b>
            </div>
            <div
              className={`curve-tip-row ${hovered.profit > 0 ? 'num-up' : hovered.profit < 0 ? 'num-down' : ''}`}
            >
              累计盈亏 {fmtSigned(hovered.profit)}
              <span className="curve-tip-pct">（{fmtPct(hovered.profit_pct)}）</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
