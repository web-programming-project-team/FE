import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, UserRound } from 'lucide-react'
import Logo from '../Logo/Logo.jsx'
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown.jsx'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Header.module.css'

// 메뉴는 4개로 고정 (제안서 5-5). 홈은 로고로 이동한다.
const MENUS = [
  { to: '/roadmap', label: '내 로드맵' },
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
        <UserMenu />
      </div>
    </header>
  )
}

function UserMenu() {
  const { profile } = useAppState()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
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

  return (
    <div className={styles.user} ref={ref}>
      <button
        type="button"
        className={`${styles.userButton} ${pathname === '/settings' ? styles.userActive : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${profile.nickname}님 메뉴`}
        onClick={() => setOpen(!open)}
      >
        <UserRound size={18} aria-hidden="true" />
        <span className={styles.userName}>{profile.nickname}님</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.userMenu} role="menu">
          <Link role="menuitem" to="/settings" onClick={() => setOpen(false)}>맞춤 설정 변경</Link>
          {/* TODO(6주차): POST /auth/logout */}
          <Link role="menuitem" to="/login" onClick={() => setOpen(false)}>로그아웃</Link>
        </div>
      )}
    </div>
  )
}
