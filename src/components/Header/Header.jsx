import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import Logo from '../Logo/Logo.jsx'
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown.jsx'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Header.module.css'

// 메뉴는 4개로 고정 (제안서 5-5)
const MENUS = [
  { to: '/', label: '내 로드맵' },
  { to: '/jobs', label: '맞춤 채용' },
  { to: '/community', label: '커뮤니티' },
  { to: '/calendar', label: 'NEXT 캘린더' },
]

export default function Header() {
  const { unreadCount, notificationOpen, setNotificationOpen } = useAppState()

  return (
    <header className={styles.header}>
      <Logo />
      <nav className={styles.nav} aria-label="주요 메뉴">
        {MENUS.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.to === '/'}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            {m.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.right}>
        <button
          type="button"
          className={styles.bell}
          aria-label={`알림 ${unreadCount}개`}
          aria-expanded={notificationOpen}
          onClick={() => setNotificationOpen(!notificationOpen)}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className={styles.dot}>{unreadCount}</span>}
        </button>
        {notificationOpen && <NotificationDropdown onClose={() => setNotificationOpen(false)} />}
      </div>
    </header>
  )
}
