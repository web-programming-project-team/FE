import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo/Logo.jsx'
import Button from '../../components/Button/Button.jsx'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Auth.module.css'

// 시안에 없는 화면 — 로그인 카드와 같은 형태로 구성
export default function Signup() {
  const navigate = useNavigate()
  const { updateProfile } = useAppState()
  const [form, setForm] = useState({ email: '', nickname: '', password: '', passwordConfirm: '' })
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const mismatch = form.passwordConfirm !== '' && form.password !== form.passwordConfirm

  const onSubmit = (e) => {
    e.preventDefault()
    const nickname = form.nickname.trim()
    if (mismatch || !nickname) return
    // TODO(6주차): POST /auth/signup
    updateProfile({ nickname })
    navigate('/onboarding')
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
          placeholder="8자 이상 입력해 주세요"
          minLength={8}
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

      <Button type="submit" size="lg" block className={styles.submit}>
        가입하기
      </Button>

      <p className={styles.switch}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </form>
  )
}
