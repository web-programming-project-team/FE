import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo/Logo.jsx'
import Button from '../../components/Button/Button.jsx'
import { authApi } from '../../api/index.js'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Auth.module.css'

// 시안에 없는 화면 — 로그인 카드와 같은 형태로 구성
// POST /auth/signup → 바로 로그인 → 온보딩
export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAppState()
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false,
    agreePrivacy: false,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const mismatch = form.passwordConfirm !== '' && form.password !== form.passwordConfirm

  const onSubmit = async (e) => {
    e.preventDefault()
    const nickname = form.nickname.trim()
    if (mismatch || !nickname) return
    setError('')
    setSubmitting(true)
    try {
      const email = form.email.trim()
      await authApi.signup({
        email,
        password: form.password,
        nickname,
        agreeTerms: form.agreeTerms,
        agreePrivacy: form.agreePrivacy,
      })
      await login(email, form.password)
      navigate('/onboarding')
    } catch (err) {
      // 입력값 오류면 서버가 준 필드별 이유를 보여준다
      setError(err.data?.errors?.[0]?.reason ?? err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h1 className="sr-only">회원가입</h1>
      <div className={styles.brand}>
        <Logo variant="text" size="lg" />
        <p className={styles.tagline}>이메일로 가입하고 나만의 로드맵을 받아 보세요</p>
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
        <span className={styles.label}>닉네임</span>
        <input
          className={styles.input}
          autoComplete="nickname"
          maxLength={12}
          placeholder="홈에서 불러드릴 이름을 입력해 주세요"
          value={form.nickname}
          onChange={set('nickname')}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>비밀번호</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          placeholder="8~20자, 영문·숫자·특수문자 포함"
          minLength={8}
          maxLength={20}
          value={form.password}
          onChange={set('password')}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>비밀번호 확인</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호를 한 번 더 입력해 주세요"
          value={form.passwordConfirm}
          onChange={set('passwordConfirm')}
          aria-invalid={mismatch}
          required
        />
        {mismatch && <span className={styles.error}>비밀번호가 일치하지 않아요</span>}
      </label>

      <label className={styles.agree}>
        <input type="checkbox" checked={form.agreeTerms} onChange={set('agreeTerms')} required />
        이용약관에 동의해요 (필수)
      </label>
      <label className={styles.agree}>
        <input type="checkbox" checked={form.agreePrivacy} onChange={set('agreePrivacy')} required />
        개인정보 수집·이용에 동의해요 (필수)
      </label>
      {error && <span className={styles.error} role="alert">{error}</span>}

      <Button type="submit" size="lg" block className={styles.submit} disabled={submitting}>
        {submitting ? '가입하는 중…' : '가입하기'}
      </Button>

      <p className={styles.switch}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </form>
  )
}
