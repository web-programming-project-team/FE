import styles from './Card.module.css'

// 흰 배경 + 24px 모서리 + 그림자. padding: md(24) | none
export default function Card({ as: Tag = 'section', padding = 'md', className = '', children, ...rest }) {
  return (
    <Tag className={`${styles.card} ${styles[padding]} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, action, as: Heading = 'h2' }) {
  return (
    <div className={styles.header}>
      <Heading className={styles.title}>{title}</Heading>
      {action}
    </div>
  )
}
