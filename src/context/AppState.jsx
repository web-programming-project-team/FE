import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { authApi, notificationApi, profileApi } from '../api/index.js'
import { tokens } from '../api/client.js'

// 화면 사이에서 공유하는 상태
// - user: 로그인한 회원 정보 + 상태·관심분야·채용 조건 (GET /users/me, GET /users/me/profile)
// - 알림: GET /notifications · /notifications/unread-count. 화면을 옮길 때와 드롭다운을 열 때 새로 받는다
const AppStateContext = createContext(null)

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

  // ── 알림 센터 ──
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { pathname } = useLocation()
  const userId = user?.userId

  // 최근 알림 20개와 안 읽은 수. 실패하면 null(화면은 그대로 두고 다음 화면 이동 때 다시 시도)
  const fetchNotifications = () =>
    Promise.all([notificationApi.list({ size: 20 }), notificationApi.unreadCount()]).catch(() => null)
  const applyNotifications = (result) => {
    if (!result) return
    setNotifications(result[0].content)
    setUnreadCount(result[1].unreadCount)
  }
  const refreshNotifications = useCallback(() => fetchNotifications().then(applyNotifications), [])

  // 로그인한 상태에서 화면을 옮길 때마다 (명세: 화면 이동 시 안 읽은 수를 가볍게 호출)
  useEffect(() => {
    if (!userId) return
    let alive = true
    fetchNotifications().then((result) => alive && applyNotifications(result))
    return () => {
      alive = false
    }
  }, [userId, pathname])

  const value = useMemo(() => {
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

      // 로그아웃하면 지난 회원의 알림을 보여주지 않는다
      notifications: userId ? notifications : [],
      unreadCount: userId ? unreadCount : 0,
      refreshNotifications,
      // 화면에 먼저 반영하고 서버에 알린다. 실패하면 다시 받아 맞춘다
      markRead: (id) => {
        const target = notifications.find((n) => n.notificationId === id)
        if (!target || target.read) return
        setNotifications((list) => list.map((n) => (n.notificationId === id ? { ...n, read: true } : n)))
        setUnreadCount((c) => Math.max(0, c - 1))
        notificationApi.read(id).catch(refreshNotifications)
      },
      markAllRead: () => {
        setNotifications((list) => list.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        notificationApi.readAll().catch(refreshNotifications)
      },
      notificationOpen,
      // 드롭다운을 열 때 최신 알림을 다시 받는다
      setNotificationOpen: (open) => {
        setNotificationOpen(open)
        if (open) refreshNotifications()
      },
    }
  }, [user, userId, reloadUser, notifications, unreadCount, refreshNotifications, notificationOpen])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  return useContext(AppStateContext)
}
