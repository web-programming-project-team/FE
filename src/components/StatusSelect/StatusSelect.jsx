import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { PROGRESS_STATUS } from '../../constants/enumLabels.js'
import styles from './StatusSelect.module.css'

const CLASS = {
  TO_CHECK: styles.toCheck,
  INTERESTED: styles.interested,
  PLANNED: styles.planned,
  APPLIED: styles.applied,
  IN_PROGRESS: styles.inProgress,
  COMPLETED: styles.completed,
}

// 진행상태 배지. onChange가 있으면 눌러서 바꿀 수 있다(단계 건너뛰기·되돌리기 허용 — 명세)
export default function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
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

  if (!onChange) {
    return <span className={`${styles.badge} ${CLASS[value]}`}>{PROGRESS_STATUS[value]}</span>
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${styles.badge} ${CLASS[value]}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {PROGRESS_STATUS[value]}
        <span className={styles.caret} aria-hidden="true" />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label="진행상태">
          {Object.entries(PROGRESS_STATUS).map(([key, label]) => (
            <li key={key}>
              <button
                type="button"
                role="option"
                aria-selected={key === value}
                className={styles.option}
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
              >
                <span className={`${styles.swatch} ${CLASS[key]}`} aria-hidden="true" />
                {label}
                {key === value && <Check size={14} className={styles.check} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
