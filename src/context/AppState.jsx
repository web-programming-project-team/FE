import { createContext, useContext, useMemo, useState } from 'react'
import { me as initialMe, notifications as initialNotifications, roadmap } from '../mocks/data.js'
import { toggled } from '../utils/set.js'

// 백엔드 연결 전까지 화면 사이에서 공유하는 상태.
// API가 붙으면 각 setter 안에서 해당 API(PATCH /roadmap-items/{id}/status 등)를 호출하도록 바꾼다.
const AppStateContext = createContext(null)

const allItems = roadmap.steps.flatMap((s) => s.items)

export function AppStateProvider({ children }) {
  const [profile, setProfile] = useState(initialMe)
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(allItems.map((i) => [i.itemId, i.status])),
  )
  const [savedJobIds, setSavedJobIds] = useState(() => new Set())
  const [calendarPolicyIds, setCalendarPolicyIds] = useState(() => new Set())
  const [notifications, setNotifications] = useState(initialNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const value = useMemo(() => {
    const itemOfPolicy = (policyId) => allItems.find((i) => i.policyId === Number(policyId))

    return {
      profile,
      updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
      updateJobPreference: (patch) =>
        setProfile((p) => ({ ...p, jobPreference: { ...p.jobPreference, ...patch } })),

      statuses,
      setItemStatus: (itemId, status) => setStatuses((s) => ({ ...s, [itemId]: status })),
      // 로드맵 생성 규칙: 새로 만든 로드맵의 항목은 모두 TO_CHECK로 시작한다 (API 명세 v1.4)
      resetRoadmap: () => setStatuses(Object.fromEntries(allItems.map((i) => [i.itemId, 'TO_CHECK']))),
      policyStatus: (policyId) => {
        const item = itemOfPolicy(policyId)
        return item ? statuses[item.itemId] : 'TO_CHECK'
      },
      setPolicyStatus: (policyId, status) => {
        const item = itemOfPolicy(policyId)
        if (item) setStatuses((s) => ({ ...s, [item.itemId]: status }))
      },

      savedJobIds,
      toggleSavedJob: (jobId) => setSavedJobIds((prev) => toggled(prev, jobId)),

      calendarPolicyIds,
      addPolicyToCalendar: (policyId) =>
        setCalendarPolicyIds((prev) => new Set(prev).add(Number(policyId))),

      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markRead: (id) =>
        setNotifications((list) => list.map((n) => (n.notificationId === id ? { ...n, read: true } : n))),
      markAllRead: () => setNotifications((list) => list.map((n) => ({ ...n, read: true }))),
      notificationOpen,
      setNotificationOpen,
    }
  }, [profile, statuses, savedJobIds, calendarPolicyIds, notifications, notificationOpen])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  return useContext(AppStateContext)
}
