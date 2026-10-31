// 알림 link(targetType, targetId) → 화면 경로. POST_LIST·CALENDAR는 명세에 없어 임시로 정한 값이다.
const PATHS = {
  POLICY: (id) => `/policies/${id}`,
  JOB_LIST: () => '/jobs',
  POST_LIST: () => '/community',
  CALENDAR: () => '/calendar',
}

export const notificationPath = ({ targetType, targetId }) => PATHS[targetType]?.(targetId) ?? '/'

// 제목 끝의 D-3을 따로 강조하기 위해 나눈다
export function splitDday(title) {
  const match = title.match(/^(.*)\s(D-\d+|D-DAY)$/)
  return match ? [match[1], match[2]] : [title, null]
}
