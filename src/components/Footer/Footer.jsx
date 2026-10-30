import styles from './Footer.module.css'

export default function Footer({ note = '예시 데이터 · 기준일 2026.10.25' }) {
  return (
    <footer className={styles.footer}>
      <p>
        <strong>NEXT 시흥</strong>
        <span aria-hidden="true">·</span>
        NextStep
      </p>
      <p>{note}</p>
    </footer>
  )
}
