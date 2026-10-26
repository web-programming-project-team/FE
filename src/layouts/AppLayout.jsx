import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <>
      <Header />
      <main className={`container ${styles.main}`}>
        <Outlet />
        <Footer />
      </main>
    </>
  )
}
