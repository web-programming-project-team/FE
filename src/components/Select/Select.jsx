import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import styles from './Select.module.css'
import Slide from '../Slide/Slide.jsx'

// 기본 <select> 대신 쓰는 드롭다운. options: [[value, label], ...]
export default function Select({ value, onChange, options, label, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find(([v]) => v === value)

  useEffect(() => {
    if (!open) return undefined
    ref.current?.querySelector('[aria-selected="true"]')?.focus()
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  // 메뉴 안에서 위아래 화살표로 이동
  const move = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...ref.current.querySelectorAll('[role="option"]')]
    const i = items.indexOf(document.activeElement) + (e.key === 'ArrowDown' ? 1 : -1)
    items[(i + items.length) % items.length]?.focus()
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.value}>{current?.[1]}</span>
        <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
      </button>
      <Slide as="ul" open={open} className={styles.menu} role="listbox" aria-label={label} onKeyDown={move}>
        {options.map(([v, text]) => (
          <li key={v}>
            <button
              type="button"
              role="option"
              aria-selected={v === value}
              className={styles.option}
              onClick={() => {
                onChange(v)
                setOpen(false)
              }}
            >
              {text}
              {v === value && <Check size={14} className={styles.check} aria-hidden="true" />}
            </button>
          </li>
        ))}
      </Slide>
    </div>
  )
}
