// 날짜는 서버와 같은 yyyy-MM-dd 문자열로 다룬다. 기준일은 오늘(브라우저 날짜)
export const today = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toIso(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

// 날짜가 없으면(상시 모집) null
export function daysUntil(iso, from = today()) {
  if (!iso) return null
  return Math.round((parseDate(iso) - from) / 86400000)
}

// 2026-10-20 → 2026.10.20
export const formatDot = (iso) => (iso ? iso.slice(0, 10).replaceAll('-', '.') : '-')

// 2026-10-28 → 10.28
export const formatShort = (iso) => (iso ? iso.slice(5, 10).replace('-', '.') : '-')

// 접수기간. 둘 다 없으면 상시
export function formatRange(start, end) {
  if (!start && !end) return '상시'
  if (!end) return `${formatDot(start)}–상시`
  if (!start) return `~${formatDot(end)}`
  return `${formatDot(start)}–${formatDot(end)}`
}

// 14:00 → 오후 2시, 14:30 → 오후 2시 30분
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}시${m ? ` ${m}분` : ''}`
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export const weekdayOf = (iso) => WEEKDAYS[parseDate(iso).getDay()]

// D-3 이하 빨강, D-4 ~ D-7 주황, 그 외 회색
export function ddayTone(days) {
  if (days === null || days === undefined) return 'neutral'
  if (days <= 3) return 'danger'
  if (days <= 7) return 'warn'
  return 'neutral'
}

export function ddayLabel(days) {
  if (days === null || days === undefined) return '상시'
  if (days === 0) return 'D-DAY'
  return days > 0 ? `D-${days}` : '마감'
}
