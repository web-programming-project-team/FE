import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import Logo from '../../components/Logo/Logo.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Button from '../../components/Button/Button.jsx'
import { ChipGroup } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, JOB_CATEGORY, LIFE_STAGE, REGION } from '../../constants/enumLabels.js'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Onboarding.module.css'

const STEPS = [
  {
    eyebrow: '나를 알아가는 첫 단계',
    title: '지금 어떤 상황인가요?',
    description: '현재 나에게 해당하는 상황을 모두 골라 주세요.',
    next: '다음은 관심분야를 골라요',
  },
  {
    eyebrow: '관심분야',
    title: '어떤 분야에 관심 있나요?',
    description: '도움받고 싶은 분야를 모두 골라 주세요.',
    next: '다음은 희망 직무와 지역을 골라요',
  },
  {
    eyebrow: '희망 직무와 지역',
    title: '어떤 일을 찾고 있나요?',
    description: '맞춤 채용공고를 고를 때 써요. 여러 개 골라도 돼요.',
    next: '선택한 내용으로 로드맵을 만들어요',
  },
]

const PREVIEW = [
  { step: 2, label: '관심분야', values: INTEREST_FIELD },
  { step: 3, label: '희망 직무', values: JOB_CATEGORY },
  { step: 3, label: '지역', values: REGION },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { updateProfile } = useAppState()
  const [step, setStep] = useState(0)
  const [lifeStages, setLifeStages] = useState([])
  const [interestFields, setInterestFields] = useState([])
  const [jobCategories, setJobCategories] = useState([])
  const [regions, setRegions] = useState(['SIHEUNG'])

  const count = [lifeStages.length, interestFields.length, jobCategories.length + regions.length][step]
  const canNext = step === 2 ? jobCategories.length > 0 && regions.length > 0 : count > 0
  const current = STEPS[step]

  const onNext = () => {
    if (step < 2) return setStep(step + 1)
    // TODO(6주차): PUT /users/me/status 로 저장 후 로드맵 생성
    updateProfile({ lifeStages, interestFields, jobCategories, regions })
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="container">
          <Logo variant="text" />
        </div>
      </header>

      <main className={`container ${styles.main}`}>
        <section className={styles.card} aria-labelledby="onboarding-title">
          <div className={styles.progressHead}>
            <span className={styles.eyebrow}>{current.eyebrow}</span>
            <span className={styles.stepCount}>
              <strong>{step + 1}</strong> / 3
            </span>
          </div>
          <div className={styles.progress} aria-hidden="true">
            <div className={styles.progressBar} style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>

          <h1 id="onboarding-title" className={styles.title}>{current.title}</h1>
          <p className={styles.description}>{current.description}</p>

          <div className={styles.options}>
            {step === 0 && (
              <ChipGroup size="lg" options={LIFE_STAGE} values={lifeStages} onChange={setLifeStages} />
            )}
            {step === 1 && (
              <ChipGroup size="lg" options={INTEREST_FIELD} values={interestFields} onChange={setInterestFields} />
            )}
            {step === 2 && (
              <>
                <h2 className={styles.groupLabel}>희망 직무</h2>
                <ChipGroup size="lg" options={JOB_CATEGORY} values={jobCategories} onChange={setJobCategories} />
                <h2 className={styles.groupLabel}>지역</h2>
                <ChipGroup size="lg" options={REGION} values={regions} onChange={setRegions} />
              </>
            )}
          </div>

          <div className={styles.foot}>
            <span>{count > 0 ? `${count}개 선택했어요` : '하나 이상 골라 주세요'}</span>
            <span>{current.next}</span>
          </div>

          <div className={styles.actions}>
            {step > 0 && (
              <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} aria-hidden="true" /> 이전
              </Button>
            )}
            <Button size="lg" block disabled={!canNext} onClick={onNext}>
              {step < 2 ? '다음' : '로드맵 만들기'} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </section>

        <ul className={styles.preview}>
          {PREVIEW.filter((p) => p.step > step + 1).map((p) => (
            <li key={p.label}>
              <strong>
                {p.step}단계 {p.label}
              </strong>
              · {Object.values(p.values).join(' / ')}
            </li>
          ))}
        </ul>

        <p className={styles.privacy}>
          <Lock size={14} aria-hidden="true" /> 민감한 개인정보는 받지 않아요
        </p>
      </main>

      <div className="container">
        <Footer note="학교에서 사회로, 다음 걸음을 함께 설계해요" />
      </div>
    </div>
  )
}
