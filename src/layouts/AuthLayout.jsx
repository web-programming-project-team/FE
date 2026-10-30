import { Outlet } from 'react-router-dom'
import styles from './AuthLayout.module.css'

// 로그인·회원가입: 화면 가운데 카드 하나
export default function AuthLayout() {
  return (
    <main className={styles.main}>
      <Outlet />
      <p className={styles.footer}>NEXT 시흥 · NextStep</p>
    </main>
  )
}
