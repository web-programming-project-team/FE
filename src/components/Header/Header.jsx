import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Search, UserRound } from 'lucide-react'
import Logo from '../Logo/Logo.jsx'
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown.jsx'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Header.module.css'
import Slide from '../Slide/Slide.jsx'

// 메뉴는 4개로 고정 (제안서 5-5). 홈은 로고로 이동한다.
const MENUS = [
  { to: '/roadmap', label: '내 로드맵' },
  { to: '/jobs', label: '맞춤 채용' },
  { to: '/community', label: '커뮤니티' },
  { to: '/calendar', label: 'NEXT 캘린더' },
]

export default function Header() {
  const { unreadCount, notificationOpen, setNotificationOpen } = useAppState()
  const navigate = useNavigate()

  const search = (e) => {
    e.preventDefault()
    const keyword = new FormData(e.currentTarget).get('keyword').trim()
    navigate(keyword ? `/policies?keyword=${encodeURIComponent(keyword)}` : '/policies')
  }

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
        <form role="search" className={styles.search} onSubmit={search}>
          <input name="keyword" type="search" placeholder="지원정보 검색" aria-label="지원정보 검색" />
          <button type="submit" aria-label="검색">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
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
        <Slide as={NotificationDropdown} open={notificationOpen} onClose={() => setNotificationOpen(false)} />
        <UserMenu />
      </div>
    </header>
  )
}

function UserMenu() {
  const { profile, logout } = useAppState()
  const { pathname } = useLocation()
  const navigate = useNavigate()
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
      <Slide open={open} className={styles.userMenu} role="menu">
        <Link role="menuitem" to="/settings" onClick={() => setOpen(false)}>맞춤 설정 변경</Link>
        <Link role="menuitem" to="/me" onClick={() => setOpen(false)}>내 기록</Link>
        {profile.role === 'ADMIN' && (
          <Link role="menuitem" to="/admin/policies" onClick={() => setOpen(false)}>관리자 화면</Link>
        )}
        <Link
          role="menuitem"
          to="/login"
          onClick={async (e) => {
            e.preventDefault()
            setOpen(false)
            await logout()
            navigate('/login')
          }}
        >
          로그아웃
        </Link>
      </Slide>
    </div>
  )
}
