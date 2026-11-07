import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import PageHead from '../../components/PageHead/PageHead.jsx'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { EVENT_TYPE } from '../../constants/enumLabels.js'
import { calendarApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { formatDot, formatShort, formatTime, parseDate, toIso, today, weekdayOf } from '../../utils/date.js'
import styles from './Calendar.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const DOT = {
  APPLY_START: styles.applyStart,
  APPLY_END: styles.applyEnd,
  COUNSELING: styles.counseling,
  PARTICIPATION: styles.participation,
  JOB_DEADLINE: styles.jobDeadline,
  CUSTOM: styles.custom,
}

// 로드맵 항목에서 자동으로 생긴 일정(itemStatus가 있음)은 지울 수 없다. 직접 추가한 정책·CUSTOM 일정만 삭제
const deletable = (e) => e.sourceType === 'CUSTOM' || (e.sourceType === 'POLICY' && !e.itemStatus)
const targetOf = (e) => (e.sourceType === 'POLICY' ? `/policies/${e.sourceId}` : e.sourceType === 'JOB' ? '/jobs' : null)

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

// NEXT 캘린더: 월별 일정(GET /calendar/events) + 다가오는 7일 마감(GET /calendar/events/upcoming)
export default function Calendar() {
  const [selected, setSelected] = useState(() => toIso(today()))
  const [view, setView] = useState(() => {
    const d = today()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const monthQuery = useApi(() => calendarApi.monthly(view.year, view.month + 1), [view.year, view.month])
  const upcomingQuery = useApi(() => calendarApi.upcoming(7), [])
  const events = useMemo(() => monthQuery.data ?? [], [monthQuery.data])
  const byDate = useMemo(() => Object.groupBy(events, (e) => e.date), [events])
  const cells = monthGrid(view.year, view.month)
  const shift = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const remove = async (eventId) => {
    if (!window.confirm('이 일정을 지울까요?')) return
    try {
      await calendarApi.remove(eventId)
      monthQuery.reload()
      upcomingQuery.reload()
    } catch (err) {
      window.alert(err.message)
    }
  }

  return (
    <div className={styles.page}>
      <PageHead
        decor="calendar"
        icon={CalendarDays}
        title="NEXT 캘린더"
        description="준비부터 마감까지, 내 로드맵의 일정을 한눈에 확인해요."
      />

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
            <span className={styles.base}>오늘 {formatDot(toIso(today()))}</span>
          </div>

          <ul className={styles.legend}>
            {['APPLY_START', 'APPLY_END', 'COUNSELING', 'PARTICIPATION', 'JOB_DEADLINE'].map((t) => (
              <li key={t}>
                <span className={`${styles.dot} ${DOT[t]}`} aria-hidden="true" />
                {EVENT_TYPE[t]}
              </li>
            ))}
          </ul>

          {monthQuery.error && <AsyncState error={monthQuery.error} onRetry={monthQuery.reload} />}
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
                          <span className={styles.cellTitle}>{e.title}</span>
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
          <SelectedDay date={selected} list={byDate[selected] ?? []} onRemove={remove} />
          <WeekDeadlines list={upcomingQuery.data} />
        </aside>
      </div>
    </div>
  )
}

function SelectedDay({ date, list, onRemove }) {
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
            const target = targetOf(e)
            return (
              <li key={e.eventId}>
                <p className={styles.selType}>
                  <span className={`${styles.dot} ${DOT[e.type]}`} aria-hidden="true" />
                  {EVENT_TYPE[e.type]}
                  {e.eventTime && ` · ${formatTime(e.eventTime)}`}
                </p>
                {target ? (
                  <Link to={target} className={styles.selTitle}>
                    {e.title}
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <p className={styles.selTitle}>{e.title}</p>
                )}
                {/* 로드맵 항목 일정이면 그 진행상태 (변경은 내 로드맵·정책 상세에서) */}
                {e.itemStatus && <StatusSelect value={e.itemStatus} />}
                {deletable(e) && (
                  <button type="button" className={styles.muted} onClick={() => onRemove(e.eventId)}>
                    <Trash2 size={14} aria-hidden="true" /> 일정 삭제
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function WeekDeadlines({ list }) {
  const deadlines = (list ?? []).filter((e) => e.type === 'APPLY_END' || e.type === 'JOB_DEADLINE')
  const from = today()
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7)

  return (
    <Card>
      <CardHeader title="이번 주 마감" />
      <p className={styles.muted}>
        {formatDot(toIso(from))}–{formatShort(toIso(to))} · 오늘부터 7일
      </p>
      <ul className={styles.weekList}>
        {deadlines.map((e) => (
          <li key={e.eventId}>
            <div>
              <strong>{e.title}</strong>
              <span className={styles.muted}>{formatShort(e.date)} 마감</span>
            </div>
            <DdayTag dDay={e.dDay} />
          </li>
        ))}
        {list && deadlines.length === 0 && <li className={styles.muted}>이번 주 마감 일정이 없어요.</li>}
      </ul>
    </Card>
  )
}
