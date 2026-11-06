import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo/Logo.jsx'
import Button from '../../components/Button/Button.jsx'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { login } = useAppState()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // POST /auth/login → 토큰 저장 → 관리자는 관리자 화면, 상태 등록 전이면 온보딩
  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form.email.trim(), form.password)
      if (user?.role === 'ADMIN') navigate('/admin/policies')
      else if (!user?.onboardingCompleted) navigate('/onboarding')
      else navigate(state?.from ?? '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h1 className="sr-only">로그인</h1>
      <div className={styles.brand}>
        <Logo variant="text" size="lg" />
        <p className={styles.tagline}>
          학교에서 사회로,
          <br />
          다음 걸음을 함께 설계해요
        </p>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>이메일</span>
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          placeholder="이메일 주소를 입력해 주세요"
          value={form.email}
          onChange={set('email')}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>비밀번호</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력해 주세요"
          value={form.password}
          onChange={set('password')}
          required
        />
        {error && <span className={styles.error} role="alert">{error}</span>}
      </label>

      <Button type="submit" size="lg" block className={styles.submit} disabled={submitting}>
        {submitting ? '로그인 중…' : '로그인'}
      </Button>

      <p className={styles.switch}>
        아직 계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </form>
  )
}
