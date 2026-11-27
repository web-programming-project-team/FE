import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Briefcase, Database, FileText, Flag } from 'lucide-react'
import Logo from '../components/Logo/Logo.jsx'
import { useAppState } from '../context/AppState.jsx'
import styles from './AdminLayout.module.css'

const MENUS = [
  { to: '/admin/policies', label: '정책 관리', icon: FileText },
  { to: '/admin/jobs', label: '채용공고 관리', icon: Briefcase },
  { to: '/admin/reports', label: '신고 관리', icon: Flag },
  { to: '/admin/collect', label: '수집·운영 지표', icon: Database },
]

export default function AdminLayout() {
  const { profile, logout } = useAppState()
  const navigate = useNavigate()
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo variant="text" to="/admin/policies" />
          <p className={styles.role}>관리자</p>
        </div>
        <nav className={styles.nav} aria-label="관리자 메뉴">
          {MENUS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.foot}>
          <p className={styles.footStrong}>NEXT 시흥 · NextStep</p>
          <p>{profile.nickname} 관리자</p>
          <button
            type="button"
            className={styles.link}
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
