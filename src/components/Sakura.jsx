import { useMemo } from 'react'

/** 日系二次元氛围：全屏飘落的樱花花瓣 + 闪烁星星 */
export default function Sakura({ count = 14 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 18,
        delay: Math.random() * 12,
        duration: 11 + Math.random() * 10,
        sway: 40 + Math.random() * 60,
        opacity: 0.45 + Math.random() * 0.4,
        spin: Math.random() * 360,
      })),
    [count],
  )
  const stars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: `s${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        size: 5 + Math.random() * 8,
      })),
    [],
  )
  return (
    <div className="sakura-stage" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="sakura-petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.15,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--sway': `${p.sway}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
      {stars.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            fontSize: s.size,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}
