import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

// badge: 헤더용 (N 배지 + NEXT 시흥), text: 로그인·온보딩·관리자용 워드마크
export default function Logo({ variant = 'badge', size = 'md', to = '/' }) {
  if (variant === 'badge') {
    return (
      <Link to={to} className={styles.badgeLogo} aria-label="NEXT 시흥 홈">
        <span className={styles.badge} aria-hidden="true">N</span>
        <span className={styles.badgeText}>NEXT 시흥</span>
      </Link>
    )
  }
  return (
    <Link to={to} className={`${styles.wordmark} ${styles[size]}`} aria-label="NEXT 시흥 홈">
      <span className={styles.next}>NEXT</span> 시흥
    </Link>
  )
}
