import { Link } from 'react-router-dom'
import styles from './Button.module.css'

// variant: primary | outline | soft | ghost, size: md(44) | lg(48)
// href → 새 탭 외부 링크(공식 사이트), to → 앱 내부 이동, 둘 다 없으면 button
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  href,
  to,
  className = '',
  children,
  ...rest
}) {
  const cls = [styles.button, styles[variant], styles[size], block && styles.block, className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  if (to) {
    return (
      <Link className={cls} to={to} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
