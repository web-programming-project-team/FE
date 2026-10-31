import styles from './Footer.module.css'

export default function Footer({ note = '나에게 필요한 지원을 찾고, 다음 걸음을 준비해요.' }) {
  return (
    <footer className={styles.footer}>
      <strong>NEXT 시흥</strong>
      <p>{note}</p>
    </footer>
  )
}
