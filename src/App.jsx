import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import RequireAuth from './components/RequireAuth/RequireAuth.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import Onboarding from './pages/onboarding/Onboarding.jsx'
import OnboardingDone from './pages/onboarding/OnboardingDone.jsx'
import Home from './pages/home/Home.jsx'
import Settings from './pages/settings/Settings.jsx'
import Roadmap from './pages/roadmap/Roadmap.jsx'
import Policies from './pages/policy/Policies.jsx'
import PolicyDetail from './pages/policy/PolicyDetail.jsx'
import Jobs from './pages/jobs/Jobs.jsx'
import JobDetail from './pages/jobs/JobDetail.jsx'
import Community from './pages/community/Community.jsx'
import PostDetail from './pages/community/PostDetail.jsx'
import Calendar from './pages/calendar/Calendar.jsx'
import MyRecords from './pages/me/MyRecords.jsx'
import AdminPolicies from './pages/admin/AdminPolicies.jsx'
import AdminJobs from './pages/admin/AdminJobs.jsx'
import Admin from './pages/admin/Admin.jsx'
import AdminCollect from './pages/admin/AdminCollect.jsx'
import HealthCheck from './pages/HealthCheck.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* 로그인만 필요 (상태 등록 전) */}
      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/done" element={<OnboardingDone />} />
      </Route>

      {/* 로그인 + 상태 등록 완료 */}
      <Route element={<RequireAuth onboarding />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/policies/:policyId" element={<PolicyDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:postId" element={<PostDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/me" element={<MyRecords />} />
          {/* 임시: 백엔드 연결 확인용. 확인 후 삭제 */}
          <Route path="/health" element={<HealthCheck />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* 관리자 (상태 등록 없이 들어올 수 있음) */}
      <Route element={<RequireAuth admin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="policies" replace />} />
          <Route path="policies" element={<AdminPolicies />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="templates" element={<Admin title="로드맵 템플릿" />} />
          <Route path="reports" element={<Admin title="신고 관리" />} />
          <Route path="collect" element={<AdminCollect />} />
        </Route>
      </Route>
    </Routes>
  )
}
