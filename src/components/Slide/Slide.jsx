import { useState } from 'react'

// open이 false가 돼도 닫히는 효과가 끝날 때까지 남겨 두었다가 내린다
export default function Slide({ open, as: Tag = 'div', className = '', children, ...rest }) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)
  if (!mounted) return null
  return (
    <Tag
      {...rest}
      className={`${className} ${open ? 'slide-open' : 'slide-close'}`}
      onAnimationEnd={(e) => {
        if (!open && e.target === e.currentTarget) setMounted(false)
      }}
    >
      {children}
    </Tag>
  )
}
