import { NavLink, Outlet } from 'react-router-dom'
import { Database, FileText, Flag, Route } from 'lucide-react'
import Logo from '../components/Logo/Logo.jsx'
import styles from './AdminLayout.module.css'

const MENUS = [
  { to: '/admin/policies', label: '정책 관리', icon: FileText },
  { to: '/admin/templates', label: '로드맵 템플릿', icon: Route },
  { to: '/admin/reports', label: '신고 관리', icon: Flag },
  { to: '/admin/collect', label: '데이터 수집', icon: Database },
]

export default function AdminLayout() {
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
          <p>정책 운영 관리</p>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
