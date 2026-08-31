/** 吉祥物：樱花小熊（纯 SVG，无外部资源） */
export default function Mascot({ size = 120, className = '' }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`mascot ${className}`}
      role="img"
      aria-label="樱花小熊吉祥物"
    >
      {/* 耳朵 */}
      <circle cx="62" cy="54" r="26" fill="#ffd0dc" />
      <circle cx="138" cy="54" r="26" fill="#ffd0dc" />
      <circle cx="62" cy="54" r="13" fill="#ff9bb3" />
      <circle cx="138" cy="54" r="13" fill="#ff9bb3" />
      {/* 头 */}
      <circle cx="100" cy="112" r="60" fill="#fff6f8" stroke="#ff9bb3" strokeWidth="3" />
      {/* 眼睛 */}
      <circle cx="78" cy="102" r="5.5" fill="#4a2c3a" />
      <circle cx="122" cy="102" r="5.5" fill="#4a2c3a" />
      <circle cx="80" cy="99.5" r="1.8" fill="#fff" />
      <circle cx="124" cy="99.5" r="1.8" fill="#fff" />
      {/* 腮红 */}
      <ellipse cx="62" cy="122" rx="11" ry="6.5" fill="#ffb3c1" opacity="0.85" />
      <ellipse cx="138" cy="122" rx="11" ry="6.5" fill="#ffb3c1" opacity="0.85" />
      {/* 嘴 */}
      <path d="M90 130 Q100 140 110 130" stroke="#4a2c3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 头上的樱花 */}
      <g transform="translate(146 32) rotate(18)">
        <path d="M0 -12 C 7 -7, 9 0, 0 9 C -9 0, -7 -7, 0 -12 Z" fill="#ff8fab" />
        <path d="M-9 -3 C -14 -10, -6 -14, 0 -11" fill="#ffa7c0" transform="rotate(-55)" />
        <circle cx="0" cy="0" r="2.2" fill="#fff" />
      </g>
      <g transform="translate(56 28) rotate(-30)">
        <path d="M0 -10 C 6 -6, 7 0, 0 8 C -7 0, -6 -6, 0 -10 Z" fill="#ffb7cd" />
        <circle cx="0" cy="0" r="1.8" fill="#fff" />
      </g>
      {/* 身体 */}
      <path d="M54 158 Q54 192 100 192 Q146 192 146 158 Z" fill="#ffd9e4" stroke="#ffb7cd" strokeWidth="2" />
      <path d="M76 158 Q100 170 124 158 Q100 150 76 158 Z" fill="#fff" opacity="0.85" />
    </svg>
  )
}
