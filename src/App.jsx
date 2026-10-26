import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import Onboarding from './pages/onboarding/Onboarding.jsx'
import Roadmap from './pages/roadmap/Roadmap.jsx'
import PolicyDetail from './pages/policy/PolicyDetail.jsx'
import Jobs from './pages/jobs/Jobs.jsx'
import JobDetail from './pages/jobs/JobDetail.jsx'
import Community from './pages/community/Community.jsx'
import PostDetail from './pages/community/PostDetail.jsx'
import Calendar from './pages/calendar/Calendar.jsx'
import MyRecords from './pages/me/MyRecords.jsx'
import AdminPolicies from './pages/admin/AdminPolicies.jsx'
import Admin from './pages/admin/Admin.jsx'
import HealthCheck from './pages/HealthCheck.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Roadmap />} />
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

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="policies" replace />} />
        <Route path="policies" element={<AdminPolicies />} />
        <Route path="templates" element={<Admin title="로드맵 템플릿" />} />
        <Route path="reports" element={<Admin title="신고 관리" />} />
        <Route path="collect" element={<Admin title="데이터 수집" />} />
      </Route>
    </Routes>
  )
}
