import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo/Logo.jsx'
import Button from '../../components/Button/Button.jsx'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    // TODO(6주차): POST /auth/login → accessToken 저장
    navigate('/')
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
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
      </label>

      <Button type="submit" size="lg" block className={styles.submit}>
        로그인
      </Button>

      <p className={styles.switch}>
        아직 계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </form>
  )
}
