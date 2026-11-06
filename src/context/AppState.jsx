import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, profileApi } from '../api/index.js'
import { tokens } from '../api/client.js'
import { notifications as initialNotifications, roadmap } from '../mocks/data.js'
import { toggled } from '../utils/set.js'

// 화면 사이에서 공유하는 상태
// - user: 로그인한 회원 정보 + 상태·관심분야·채용 조건 (GET /users/me, GET /users/me/profile)
// - 맞춤 채용·커뮤니티·알림은 백엔드 구현 전이라 아래 예시 상태를 계속 쓴다
const AppStateContext = createContext(null)

const mockItems = roadmap.steps.flatMap((s) => s.items)
const EMPTY_PREFERENCE = { regions: [], education: null, careerLevel: null, jobCategories: [], employmentTypes: [] }

async function fetchUser() {
  const me = await authApi.me()
  const profile = me.onboardingCompleted ? await profileApi.get() : null
  return {
    ...me,
    lifeStages: profile?.lifeStages ?? [],
    interests: profile?.interests ?? [],
    jobPreference: profile?.jobPreference ?? EMPTY_PREFERENCE,
  }
}

export function AppStateProvider({ children }) {
  // undefined: 확인 중 · null: 비로그인 · 객체: 로그인
  const [user, setUser] = useState(() => (tokens.access() ? undefined : null))

  const reloadUser = useCallback(async () => {
    if (!tokens.access()) {
      setUser(null)
      return null
    }
    try {
      const next = await fetchUser()
      setUser(next)
      return next
    } catch {
      setUser(null)
      return null
    }
  }, [])

  // 새로고침해도 저장된 토큰으로 로그인 상태를 되살린다
  useEffect(() => {
    if (!tokens.access()) return
    fetchUser()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  // ── 예시 데이터 상태 (맞춤 채용·커뮤니티·알림 화면용) ──
  const [statuses, setStatuses] = useState(() => Object.fromEntries(mockItems.map((i) => [i.itemId, i.status])))
  const [savedJobIds, setSavedJobIds] = useState(() => new Set())
  const [notifications, setNotifications] = useState(initialNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const value = useMemo(() => {
    const itemOfPolicy = (policyId) => mockItems.find((i) => i.policyId === Number(policyId))

    return {
      user,
      reloadUser,
      login: async (email, password) => {
        await authApi.login({ email, password })
        return reloadUser()
      },
      logout: async () => {
        await authApi.logout().catch(() => {})
        setUser(null)
      },

      // 기존 화면 호환: profile = 로그인 회원 정보
      profile: user ?? { nickname: '', lifeStages: [], interests: [], jobPreference: EMPTY_PREFERENCE },
      // 채용 조건 수정 (PATCH /users/me/job-preference, 보낸 필드만 바뀜)
      updateJobPreference: async (patch) => {
        const jobPreference = await profileApi.updateJobPreference(patch)
        setUser((u) => (u ? { ...u, jobPreference } : u))
      },

      // 맞춤 채용·후기 화면의 예시 진행상태 (해당 화면이 API로 바뀌면 지운다)
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

      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markRead: (id) =>
        setNotifications((list) => list.map((n) => (n.notificationId === id ? { ...n, read: true } : n))),
      markAllRead: () => setNotifications((list) => list.map((n) => ({ ...n, read: true }))),
      notificationOpen,
      setNotificationOpen,
    }
  }, [user, reloadUser, statuses, savedJobIds, notifications, notificationOpen])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  return useContext(AppStateContext)
}
