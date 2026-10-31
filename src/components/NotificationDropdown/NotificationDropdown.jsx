import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppState.jsx'
import { notificationPath, splitDday } from '../../utils/notification.js'
import styles from './NotificationDropdown.module.css'

const TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'DEADLINE', label: '마감' },
  { key: 'NEW_JOB', label: '공고' },
  { key: 'NEW_REVIEW', label: '후기' },
]

// 알림 카드 위 작은 분류 문구 (시안 기준, 서버 enum 표시명과 별개)
const CATEGORY = {
  DEADLINE: '다가오는 마감',
  NEW_JOB: '맞춤 채용',
  NEW_REVIEW: '참여 후기',
  SYSTEM: '안내',
}

// 알림 센터 — 헤더 종 아이콘 드롭다운 (별도 경로 없음)
export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markRead, markAllRead } = useAppState()
  const [tab, setTab] = useState('ALL')
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.parentElement.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [onClose])

  const list = tab === 'ALL' ? notifications : notifications.filter((n) => n.type === tab)

  return (
    <div className={styles.panel} ref={ref} role="dialog" aria-label="알림">
      <div className={styles.head}>
        <h2 className={styles.title}>
          알림 {unreadCount > 0 && <span className={styles.count}>{unreadCount}</span>}
        </h2>
        <button type="button" className={styles.readAll} onClick={markAllRead}>
          모두 읽음
        </button>
      </div>
      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className={styles.list}>
        {list.length === 0 && <li className={styles.empty}>새 알림이 없어요</li>}
        {list.map((n) => {
          const [text, dday] = splitDday(n.title)
          return (
          <li key={n.notificationId}>
            <button
              type="button"
              className={`${styles.item} ${n.read ? styles.read : ''}`}
              onClick={() => {
                markRead(n.notificationId)
                onClose()
                navigate(notificationPath(n.link))
              }}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={`${styles.category} ${n.type === 'DEADLINE' ? styles.urgent : ''}`}>
                {CATEGORY[n.type]}
              </span>
              <strong className={styles.itemTitle}>
                {text}
                {dday && <em className={styles.dday}>{dday}</em>}
              </strong>
              <span className={styles.body}>{n.body}</span>
            </button>
          </li>
          )
        })}
      </ul>
    </div>
  )
}
