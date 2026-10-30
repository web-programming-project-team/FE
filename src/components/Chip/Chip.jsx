import { Check } from 'lucide-react'
import styles from './Chip.module.css'

// 선택형 칩. size: sm(32) | md(36) | lg(44, 온보딩)
export function Chip({ selected = false, size = 'md', showCheck = true, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`${styles.chip} ${styles[size]} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {selected && showCheck && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </button>
  )
}

// 읽기 전용 태그. tone: outline | fill | soft
export function Tag({ tone = 'fill', children }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>
}

// 여러 개 고르는 칩 묶음 (values: 선택된 값 배열)
export function ChipGroup({ options, values, onChange, size, multiple = true }) {
  const toggle = (value) => {
    if (!multiple) return onChange([value])
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }
  return (
    <div className={styles.group}>
      {Object.entries(options).map(([value, label]) => (
        <Chip key={value} size={size} selected={values.includes(value)} onClick={() => toggle(value)}>
          {label}
        </Chip>
      ))}
    </div>
  )
}
