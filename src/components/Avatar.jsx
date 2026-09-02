import { useState } from 'react'

const PALETTE = ['#ff9bb3', '#b8a9ff', '#7fd0e8', '#ffc46b', '#a8d8a0', '#f4a9e8', '#8fc7ff']

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/** 头像：有 face 显示图片，否则显示人形图标（不再用首字母） */
export default function Avatar({ src, nickname = '?', size = 44, className = '' }) {
  const [broken, setBroken] = useState(false)
  const color = hashHue(nickname)

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
        background: `linear-gradient(135deg, ${color}, #fff0f4 160%)`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.56}
        height={size * 0.56}
        fill="currentColor"
        focusable="false"
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2.5c-3.7 0-8 1.9-8 5V22h16v-2.5c0-3.1-4.3-5-8-5Z" />
      </svg>
    </span>
  )
}
