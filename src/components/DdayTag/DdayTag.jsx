import { daysUntil, ddayLabel, ddayTone } from '../../utils/date.js'
import styles from './DdayTag.module.css'

// 서버가 준 dDay가 있으면 그 값을, 없으면 date로 계산한다. 둘 다 없으면 '상시'
export default function DdayTag({ date, dDay }) {
  const days = dDay !== undefined ? dDay : daysUntil(date)
  return <span className={`${styles.tag} ${styles[ddayTone(days)]}`}>{ddayLabel(days)}</span>
}
