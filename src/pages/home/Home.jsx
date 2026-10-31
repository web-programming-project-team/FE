import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, LIFE_STAGE } from '../../constants/enumLabels.js'
import { policyById, roadmap } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import styles from './Home.module.css'

// 관심분야별 지원정보 카드 문구. 분야 값은 API 명세의 InterestField를 따른다.
const INTEREST_CARD = {
  EMPLOYMENT: { title: '취업 준비에 필요한 지원', body: '상담부터 직무역량, 취업지원사업까지' },
  EDUCATION: { title: '배움을 이어갈 지원', body: '교육 과정과 자격 준비에 필요한 지원 확인' },
  HOUSING: { title: '주거 고민을 덜어줄 지원', body: '내 상황에 맞는 주거지원과 신청 조건 확인' },
  FINANCE: { title: '금융 부담을 덜어줄 지원', body: '저축과 생활비에 도움 되는 지원 확인' },
  COUNSELING: { title: '혼자 고민하지 않도록 돕는 지원', body: '진로·심리 상담 프로그램 확인' },
  CULTURE_LIFE: { title: '일상을 챙기는 지원', body: '문화·생활 지원 프로그램 확인' },
}

const itemTitle = (item) => (item.policyId ? policyById(item.policyId).title : item.title)

function stepState(step, statuses) {
  const values = step.items.map((i) => statuses[i.itemId])
  if (values.every((s) => s === 'COMPLETED')) return '완료'
  if (values.every((s) => s === 'TO_CHECK')) return '시작 전'
  return '진행 중'
}

export default function Home() {
  const { profile, statuses } = useAppState()

  const values = Object.values(statuses)
  const completed = values.filter((s) => s === 'COMPLETED').length
  const stage = profile.lifeStages.map((s) => LIFE_STAGE[s]).join(' · ')
  const current = roadmap.steps.find((s) => stepState(s, statuses) !== '완료')

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>나의 다음 걸음</p>
          <h1 className={styles.title}>
            {profile.nickname}님, {completed === 0 ? '첫 걸음을 함께 시작해요' : '다음 걸음을 이어가요'}
          </h1>
          <p className={styles.description}>{stage}에 필요한 지원을 내 로드맵에서 하나씩 살펴보세요.</p>
        </div>
        <Link to="/settings" className={styles.link}>
          맞춤 설정 변경 <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.columns}>
        <Card className={styles.roadmap}>
          <CardHeader
            title="내 로드맵"
            action={
              <Link to="/roadmap" className={styles.link}>
                전체 로드맵 보기 <ChevronRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <div className={styles.progressHead}>
            <span>{roadmap.steps.length}단계 · 총 {values.length}개 항목</span>
            <span><b>{completed}</b> / {values.length}개 완료</span>
          </div>
          <div
            className={styles.bar}
            role="progressbar"
            aria-label="완료한 항목"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={values.length}
          >
            <div className={styles.barFill} style={{ width: `${(completed / values.length) * 100}%` }} />
          </div>

          <ol className={styles.steps}>
            {roadmap.steps.map((step) =>
              step === current ? (
                <li key={step.stepOrder} className={styles.current}>
                  <span className={`${styles.order} ${styles.orderCurrent}`}>{step.stepOrder}</span>
                  <div>
                    <p className={styles.startHere}>
                      {completed === 0 ? '여기서 시작해 보세요' : '지금 살펴볼 단계예요'}
                    </p>
                    <h3 className={styles.currentTitle}>{step.title}</h3>
                    <p className={styles.currentBody}>{step.items.map(itemTitle).join(' · ')}</p>
                    <Button to="/roadmap" state={{ step: step.stepOrder }} className={styles.cta}>
                      {step.title} 살펴보기 <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ) : (
                <li key={step.stepOrder}>
                  <Link to="/roadmap" state={{ step: step.stepOrder }} className={styles.row}>
                    <span className={styles.order}>
                      {stepState(step, statuses) === '완료' ? (
                        <Check size={14} strokeWidth={2.5} aria-label="완료" />
                      ) : (
                        step.stepOrder
                      )}
                    </span>
                    <span className={styles.rowTitle}>{step.title}</span>
                    <span className={styles.rowState}>{stepState(step, statuses)}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ),
            )}
          </ol>
        </Card>

        <aside className={styles.side}>
          <Card>
            <div className={styles.sideHead}>
              <h2 className={styles.sideTitle}>나의 설정</h2>
              <Link to="/settings" className={styles.edit}>수정</Link>
            </div>
            <h3 className={styles.label}>현재 상황</h3>
            <p className={styles.value}>{stage}</p>
            <h3 className={styles.label}>관심분야</h3>
            <div className={styles.tags}>
              {profile.interests.map((f) => (
                <Tag key={f} tone="outline">{INTEREST_FIELD[f]}</Tag>
              ))}
            </div>
            <p className={styles.sideNote}>설정한 상황과 관심분야를 바탕으로 로드맵을 준비했어요.</p>
          </Card>
          <div className={styles.guide}>
            <h2 className={styles.guideTitle}>로드맵은 이렇게 이용해요</h2>
            <p>관심 있는 항목부터 살펴봐도 괜찮아요. 지원 대상과 신청 방법을 확인하고, 마친 항목은 완료로 표시해 보세요.</p>
            <p className={styles.guideNote}>상황이 달라지면 언제든 설정을 바꿀 수 있어요.</p>
          </div>
        </aside>
      </div>

      <section aria-labelledby="interest-title">
        <div className={styles.sectionHead}>
          <h2 id="interest-title" className={styles.sectionTitle}>관심분야 지원정보</h2>
          <Link to="/policies" className={styles.link}>
            전체 지원정보 보기 <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ul className={styles.interests}>
          {profile.interests.map((f) => (
            <li key={f}>
              <Link to={`/policies?field=${f}`} className={styles.interest}>
                <span>
                  <strong>{INTEREST_CARD[f].title}</strong>
                  <span>{INTEREST_CARD[f].body}</span>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
