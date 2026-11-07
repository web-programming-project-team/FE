import styles from './PageHead.module.css'

// 메뉴 첫 화면 상단 설명 박스: 아이콘 + 제목 + 한 줄 설명, 오른쪽에 actions
// quiet: 오른쪽에 정보가 많을 때(로드맵 진행률) 점 장식을 빼고 링만 남김
export default function PageHead({ icon: Icon, title, description, actions, quiet = false }) {
  return (
    <header className={`${styles.head} ${quiet ? styles.quiet : ''}`}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={28} strokeWidth={1.75} />
      </span>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
