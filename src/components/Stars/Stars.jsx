import { Star } from 'lucide-react'
import styles from './Stars.module.css'

// 읽기 전용 별점
export function Stars({ value, size = 14 }) {
  return (
    <span className={styles.stars} aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? styles.on : styles.off} aria-hidden="true" />
      ))}
      <span className={styles.score}>{value.toFixed(1)}</span>
    </span>
  )
}

// 별점 입력 (1분 후기)
export function StarInput({ value, onChange }) {
  return (
    <div className={styles.input} role="radiogroup" aria-label="참여 경험 별점">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n}점`}
          onClick={() => onChange(n)}
        >
          <Star size={32} className={n <= value ? styles.on : styles.off} />
        </button>
      ))}
      <span className={styles.inputScore}>{value}점</span>
    </div>
  )
}
