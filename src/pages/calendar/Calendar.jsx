import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import { EVENT_TYPE } from '../../constants/enumLabels.js'
import { BASE_DATE, events, policyById } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatDot, formatShort, formatTime, parseDate, toIso, today, weekdayOf } from '../../utils/date.js'
import styles from './Calendar.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const policyOf = (e) => (e.sourceType === 'POLICY' ? policyById(e.sourceId) : null)
const DOT = {
  APPLY_START: styles.applyStart,
  APPLY_END: styles.applyEnd,
  COUNSELING: styles.counseling,
  PARTICIPATION: styles.participation,
  JOB_DEADLINE: styles.jobDeadline,
  CUSTOM: styles.custom,
}

// 일요일 시작, 그 달을 덮는 주 수만큼의 격자
function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7)
  const start = new Date(year, month, 1 - first.getDay())
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: toIso(d), day: d.getDate(), inMonth: d.getMonth() === month }
  })
}

export default function Calendar() {
  const { unreadCount, setNotificationOpen } = useAppState()
  const [selected, setSelected] = useState('2026-11-05')
  const [view, setView] = useState(() => {
    const d = parseDate('2026-11-05')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const byDate = useMemo(() => Object.groupBy(events, (e) => e.date), [])
  const cells = monthGrid(view.year, view.month)
  const shift = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>NEXT 캘린더</h1>
          <p className={styles.description}>준비부터 마감까지, 내 로드맵의 일정을 한눈에 확인해요.</p>
        </div>
        <button type="button" className={styles.notiButton} onClick={() => setNotificationOpen(true)}>
          <Bell size={16} aria-hidden="true" /> 알림 {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>
      </header>

      <div className={styles.columns}>
        <Card className={styles.calendar}>
          <div className={styles.calHead}>
            <div className={styles.monthNav}>
              <h2 className={styles.month}>
                {view.year}년 {view.month + 1}월
              </h2>
              <button type="button" aria-label="이전 달" onClick={() => shift(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="다음 달" onClick={() => shift(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
            <span className={styles.base}>기준일 {formatDot(BASE_DATE)}</span>
          </div>

          <ul className={styles.legend}>
            {['APPLY_START', 'APPLY_END', 'COUNSELING', 'PARTICIPATION', 'JOB_DEADLINE'].map((t) => (
              <li key={t}>
                <span className={`${styles.dot} ${DOT[t]}`} aria-hidden="true" />
                {EVENT_TYPE[t]}
              </li>
            ))}
          </ul>

          <div className={styles.gridWrap}>
            <div className={styles.grid} role="grid" aria-label={`${view.year}년 ${view.month + 1}월`}>
              {WEEKDAYS.map((w) => (
                <div key={w} className={styles.weekday} role="columnheader">{w}</div>
              ))}
              {cells.map((c) => {
                const dayEvents = byDate[c.iso] ?? []
                const isSelected = c.iso === selected
                const isToday = c.iso === toIso(today())
                return (
                  <button
                    key={c.iso}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-label={`${c.iso} 일정 ${dayEvents.length}개`}
                    className={[
                      styles.cell,
                      !c.inMonth && styles.outside,
                      isSelected && styles.selected,
                      isToday && styles.today,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelected(c.iso)}
                  >
                    <span className={styles.dayNum}>{c.day}</span>
                    <span className={styles.cellEvents}>
                      {dayEvents.map((e) => (
                        <span key={e.eventId} className={styles.cellEvent}>
                          <span className={`${styles.dot} ${styles.small} ${DOT[e.type]}`} aria-hidden="true" />
                          {e.title}
                        </span>
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        <aside className={styles.side}>
          <SelectedDay date={selected} list={byDate[selected] ?? []} />
          <WeekDeadlines />
        </aside>
      </div>
    </div>
  )
}

function SelectedDay({ date, list }) {
  const { policyStatus, setPolicyStatus } = useAppState()
  const d = parseDate(date)
  return (
    <Card>
      <div className={styles.selHead}>
        <span className={styles.eyebrow}>선택한 날짜</span>
        <span className={styles.muted}>일정 {list.length}개</span>
      </div>
      <h2 className={styles.selDate}>
        {d.getMonth() + 1}월 {d.getDate()}일 <span>{weekdayOf(date)}요일</span>
      </h2>
      {list.length === 0 ? (
        <p className={styles.noEvent}>이 날은 일정이 없어요.</p>
      ) : (
        <ul className={styles.selList}>
          {list.map((e) => {
            const policy = policyOf(e)
            const target = policy ? `/policies/${policy.policyId}` : '/jobs'
            return (
              <li key={e.eventId}>
                <p className={styles.selType}>
                  <span className={`${styles.dot} ${DOT[e.type]}`} aria-hidden="true" />
                  {EVENT_TYPE[e.type]}
                  {e.eventTime && ` · ${formatTime(e.eventTime)}`}
                </p>
                <Link to={target} className={styles.selTitle}>
                  {policy?.title ?? e.title}
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
                {policy && <p className={styles.muted}>{policy.agency}</p>}
                {policy && (
                  <StatusSelect
                    value={policyStatus(policy.policyId)}
                    onChange={(s) => setPolicyStatus(policy.policyId, s)}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function WeekDeadlines() {
  const start = today()
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
  const [from, to] = [toIso(start), toIso(end)]
  const list = events.filter(
    (e) => (e.type === 'APPLY_END' || e.type === 'JOB_DEADLINE') && e.date >= from && e.date <= to,
  )

  return (
    <Card>
      <CardHeader title="이번 주 마감" />
      <p className={styles.muted}>
        {formatDot(from)}–{formatShort(to)} · 일요일 시작
      </p>
      <ul className={styles.weekList}>
        {list.map((e) => {
          const policy = policyOf(e)
          return (
            <li key={e.eventId}>
              <div>
                <strong>{policy?.title ?? e.title}</strong>
                <span className={styles.muted}>{formatShort(e.date)} 마감</span>
              </div>
              <DdayTag date={e.date} />
            </li>
          )
        })}
        {list.length === 0 && <li className={styles.muted}>이번 주 마감 일정이 없어요.</li>}
      </ul>
      <p className={styles.weekNote}>이번 주와 D-day는 기준일 {formatDot(BASE_DATE)}를 기준으로 표시해요.</p>
    </Card>
  )
}
