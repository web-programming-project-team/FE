import styles from './Toggle.module.css'

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className={styles.row}>
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.track} aria-hidden="true" />
    </label>
  )
}
