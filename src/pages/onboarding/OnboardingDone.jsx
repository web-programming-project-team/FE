import { ArrowRight, Check } from 'lucide-react'
import Logo from '../../components/Logo/Logo.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, LIFE_STAGE } from '../../constants/enumLabels.js'
import { roadmap } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import styles from './OnboardingDone.module.css'

const itemCount = roadmap.steps.reduce((n, s) => n + s.items.length, 0)

export default function OnboardingDone() {
  const { profile } = useAppState()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <span className={styles.status}>
          <Check size={16} aria-hidden="true" /> 초기 설정 완료
        </span>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <span className={styles.mark} aria-hidden="true">
            <Check size={28} strokeWidth={2.5} />
          </span>
          <p className={styles.eyebrow}>온보딩 완료</p>
          <h1 className={styles.title}>
            {profile.nickname}님을 위한 로드맵이
            <br />
            준비됐어요
          </h1>
          <p className={styles.description}>
            지금의 상황과 관심분야에 맞춰
            <br />
            필요한 지원과 다음 할 일을 모았어요.
            <br />
            내 로드맵에서 다음 걸음을 시작해 보세요.
          </p>
          <div className={styles.actions}>
            <Button size="lg" to="/">
              내 로드맵 시작하기 <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button size="lg" variant="ghost" to="/settings">설정 다시 확인</Button>
          </div>
          <p className={styles.hint}>상황과 관심분야는 맞춤 설정에서 언제든 바꿀 수 있어요.</p>
        </section>

        <Card className={styles.summary}>
          <div className={styles.summaryHead}>
            <h2 className={styles.summaryTitle}>나의 설정</h2>
            <span className={styles.done}>
              <Check size={14} aria-hidden="true" /> 설정 완료
            </span>
          </div>

          <h3 className={styles.label}>현재 상황</h3>
          <p className={styles.value}>{profile.lifeStages.map((s) => LIFE_STAGE[s]).join(' · ')}</p>

          <h3 className={styles.label}>관심분야</h3>
          <div className={styles.tags}>
            {profile.interests.map((f) => (
              <Tag key={f} tone="outline">{INTEREST_FIELD[f]}</Tag>
            ))}
          </div>

          <div className={styles.roadmapHead}>
            <h3 className={styles.roadmapTitle}>앞으로 살펴볼 로드맵</h3>
            <span className={styles.count}>
              {roadmap.steps.length}단계 · {itemCount}개 항목
            </span>
          </div>
          <ol className={styles.steps}>
            {roadmap.steps.map((step) => (
              <li key={step.stepOrder}>
                <span className={styles.order}>{step.stepOrder}</span>
                {step.title}
              </li>
            ))}
          </ol>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
