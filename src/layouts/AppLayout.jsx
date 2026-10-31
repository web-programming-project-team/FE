import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={`container ${styles.main}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
