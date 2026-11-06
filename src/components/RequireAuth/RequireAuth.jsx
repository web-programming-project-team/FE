import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../../context/AppState.jsx'
import AsyncState from '../AsyncState/AsyncState.jsx'

// 로그인이 필요한 화면 묶음
// - onboarding: true면 상태 등록을 끝낸 회원만 (아니면 온보딩으로)
// - admin: true면 관리자만 (아니면 홈으로)
export default function RequireAuth({ onboarding = false, admin = false }) {
  const { user } = useAppState()
  const location = useLocation()

  if (user === undefined) return <AsyncState loading />
  if (user === null) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />
  if (onboarding && !user.onboardingCompleted) return <Navigate to="/onboarding" replace />
  return <Outlet />
}
