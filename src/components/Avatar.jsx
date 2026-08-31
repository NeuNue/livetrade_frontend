import { useState } from 'react'

const PALETTE = ['#ff9bb3', '#b8a9ff', '#7fd0e8', '#ffc46b', '#a8d8a0', '#f4a9e8', '#8fc7ff']

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/** 头像：有 face 显示图片，否则显示昵称首字符的渐变圆 */
export default function Avatar({ src, nickname = '?', size = 44, className = '' }) {
  const [broken, setBroken] = useState(false)
  const color = hashHue(nickname)
  const initials = (nickname || '?').trim().slice(0, 1)

  if (src && !broken) {
    return (
      <img
        className={`avatar-img ${className}`}
        src={src}
        alt={nickname}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    )
  }
  return (
    <span
      className={`avatar-fallback ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${color}, #fff0f4 160%)`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
