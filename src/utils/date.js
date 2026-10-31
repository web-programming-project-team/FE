import { BASE_DATE } from '../mocks/data.js'

// 시안과 예시 데이터는 기준일 2026.10.25 기준. 실데이터 연결 후에는 오늘 날짜로 바꾼다.
export const today = () => parseDate(BASE_DATE)

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toIso(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function daysUntil(iso, from = today()) {
  return Math.round((parseDate(iso) - from) / 86400000)
}

// 2026-10-20 → 2026.10.20
export const formatDot = (iso) => iso.slice(0, 10).replaceAll('-', '.')

// 2026-10-28 → 10.28
export const formatShort = (iso) => iso.slice(5).replace('-', '.')

export const formatRange = (start, end) => `${formatDot(start)}–${formatDot(end)}`

// 14:00 → 오후 2시, 14:30 → 오후 2시 30분
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}시${m ? ` ${m}분` : ''}`
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export const weekdayOf = (iso) => WEEKDAYS[parseDate(iso).getDay()]

// D-3 이하 빨강, D-4 ~ D-7 주황, 그 외 회색
export function ddayTone(days) {
  if (days <= 3) return 'danger'
  if (days <= 7) return 'warn'
  return 'neutral'
}

export function ddayLabel(days) {
  if (days === 0) return 'D-DAY'
  return days > 0 ? `D-${days}` : '마감'
}
