import { daysUntil, ddayLabel, ddayTone } from '../../utils/date.js'
import styles from './DdayTag.module.css'

export default function DdayTag({ date }) {
  const days = daysUntil(date)
  return <span className={`${styles.tag} ${styles[ddayTone(days)]}`}>{ddayLabel(days)}</span>
}
