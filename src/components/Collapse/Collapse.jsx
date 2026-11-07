import { useState } from 'react'
import styles from './Collapse.module.css'

// 화면 흐름 안에서 펼치고 접는 영역. 높이가 부드럽게 바뀌어 아래 요소가 한 번에 밀리지 않는다
// (떠 있는 메뉴는 Slide 사용). 처음 펼칠 때 내용을 그리고, 접은 뒤에는 남겨 두되 inert로 포커스·스크린리더에서 뺀다
export default function Collapse({ open, className = '', children }) {
  const [shown, setShown] = useState(open)
  if (open && !shown) setShown(true)
  return (
    <div className={`${styles.collapse} ${open ? styles.open : ''}`} inert={!open}>
      <div className={styles.inner}>
        {shown && <div className={className}>{children}</div>}
      </div>
    </div>
  )
}
