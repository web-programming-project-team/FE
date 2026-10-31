import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp, ExternalLink } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import StatusChangeModal from './StatusChangeModal.jsx'
import { INTEREST_FIELD, LIFE_STAGE } from '../../constants/enumLabels.js'
import { jobs, nextActions, policyById, roadmap } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { daysUntil, formatDot, formatRange } from '../../utils/date.js'
import { toggled } from '../../utils/set.js'
import styles from './Roadmap.module.css'

// 항목 정보: 정책에 연결된 항목은 정책 데이터를 합친다
const resolveItem = (item) => ({ ...item, policy: item.policyId ? policyById(item.policyId) : null })

// 임시 진행률 — 완료 1, 진행 중 2/3 가중. 서버 rate(GET /roadmaps/me) 연결 시 그 값을 그대로 쓴다.
function summarize(statuses) {
  const values = Object.values(statuses)
  const completed = values.filter((s) => s === 'COMPLETED').length
  const remaining = values.filter((s) => s === 'TO_CHECK').length
  const inProgress = values.length - completed - remaining
  const rate = Math.round(((completed + (inProgress * 2) / 3) / values.length) * 100)
  return { completed, inProgress, remaining, rate }
}

export default function Roadmap() {
  const { profile, statuses, setItemStatus } = useAppState()
  const [modalOpen, setModalOpen] = useState(false)

  const stepDone = (step) => step.items.every((i) => statuses[i.itemId] === 'COMPLETED')
  const currentStep = roadmap.steps.find((s) => !stepDone(s))?.stepOrder ?? null
  // 홈에서 단계를 눌러 들어오면 그 단계를 펼친다
  const { state } = useLocation()
  const [openSteps, setOpenSteps] = useState(() => new Set([state?.step ?? currentStep]))
  const toggleStep = (order) => setOpenSteps((prev) => toggled(prev, order))

  const summary = summarize(statuses)
  const itemCount = roadmap.steps.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className={styles.page}>
      <Card className={styles.summary}>
        <div className={styles.summaryMain}>
          <div className={styles.greeting}>
            <h1 className={styles.title}>{profile.nickname}님, 다음 걸음을 준비해요</h1>
            <button type="button" className={styles.changeLink} onClick={() => setModalOpen(true)}>
              상황 바꾸기 <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.profileRow}>
            <span className={styles.stagePill}>
              {profile.lifeStages.map((s) => LIFE_STAGE[s]).join(' · ')}
            </span>
            <span className={styles.muted}>관심분야</span>
            {profile.interests.map((f) => (
              <Tag key={f} tone="outline">{INTEREST_FIELD[f]}</Tag>
            ))}
          </div>
        </div>

        <div className={styles.progressBox}>
          <div className={styles.progressHead}>
            <span>전체 진행률</span>
            <strong className={styles.rate}>
              {summary.rate}
              <small>%</small>
            </strong>
          </div>
          <div className={styles.bar} role="progressbar" aria-valuenow={summary.rate} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.barFill} style={{ width: `${summary.rate}%` }} />
          </div>
          <div className={styles.progressFoot}>
            <span>
              완료 <b>{summary.completed}</b> · 진행 중 <b>{summary.inProgress}</b> · 남음 <b>{summary.remaining}</b>
            </span>
            <span className={styles.muted}>단계별 가중 진행률</span>
          </div>
        </div>
      </Card>

      <div className={styles.columns}>
        <section aria-labelledby="roadmap-title">
          <div className={styles.sectionHead}>
            <h2 id="roadmap-title" className={styles.sectionTitle}>내 로드맵</h2>
            <span className={styles.muted}>
              {roadmap.steps.length}단계 · {itemCount}개 항목
            </span>
          </div>

          <ol className={styles.timeline}>
            {roadmap.steps.map((step, index) => {
              const done = stepDone(step)
              const isCurrent = step.stepOrder === currentStep
              const open = openSteps.has(step.stepOrder)
              const isLast = index === roadmap.steps.length - 1
              return (
                <li
                  key={step.stepOrder}
                  className={`${styles.step} ${isCurrent ? styles.current : ''} ${done ? styles.done : ''}`}
                >
                  {!isLast && <span className={styles.line} aria-hidden="true" />}
                  <span className={styles.marker} aria-hidden="true">
                    {done ? <Check size={14} strokeWidth={2.5} /> : step.stepOrder}
                  </span>
                  <button
                    type="button"
                    className={styles.stepHead}
                    aria-expanded={open}
                    onClick={() => toggleStep(step.stepOrder)}
                  >
                    <span className={styles.stepTitle}>
                      {step.title}
                      {done && (
                        <span className={styles.doneBadge}>
                          <Check size={12} strokeWidth={2.5} aria-hidden="true" /> 완료
                        </span>
                      )}
                      {isCurrent && <span className={styles.currentBadge}>현재 단계</span>}
                    </span>
                    <span className={styles.stepMeta}>
                      {step.items.length}개 항목
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {open && (
                    <div className={styles.items}>
                      {step.items.map(resolveItem).map((item) => (
                        <RoadmapItem
                          key={item.itemId}
                          item={item}
                          status={statuses[item.itemId]}
                          onStatusChange={(s) => setItemStatus(item.itemId, s)}
                        />
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <aside className={styles.side}>
          <NextActions />
          <UpcomingDeadlines />
          <Link to="/jobs" className={styles.jobsBanner}>
            <span>
              <strong>새 맞춤 공고 3건</strong>
              <span>사무·IT 신입 공고를 확인해 보세요</span>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </aside>
      </div>

      {modalOpen && (
        <StatusChangeModal
          open
          onClose={() => setModalOpen(false)}
          onRenewed={() => setOpenSteps(new Set([roadmap.steps[0].stepOrder]))}
        />
      )}
    </div>
  )
}

function RoadmapItem({ item, status, onStatusChange }) {
  const { policy } = item
  return (
    <Card as="article" className={styles.itemCard}>
      <div className={styles.itemTop}>
        <h3 className={styles.itemTitle}>{policy?.title ?? item.title}</h3>
        {policy && <DdayTag date={policy.applyEndDate} />}
      </div>
      <div className={styles.itemSub}>
        <span>{policy?.agency ?? item.agency}</span>
        {policy && (
          <span>
            <span className={styles.muted}>접수</span> {formatRange(policy.applyStartDate, policy.applyEndDate)}
          </span>
        )}
      </div>
      <div className={styles.itemActions}>
        <StatusSelect value={status} onChange={onStatusChange} />
        {policy && (
          <div className={styles.buttons}>
            <Button variant="outline" to={`/policies/${policy.policyId}`}>자세히</Button>
            <Button href={policy.applyUrl}>
              공식 사이트 <ExternalLink size={14} aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      {policy && (
        <p className={styles.source}>
          마지막 정보 확인일 {formatDot(policy.lastVerifiedAt)} · 출처 {policy.agency}
        </p>
      )}
    </Card>
  )
}

function NextActions() {
  const { statuses, setItemStatus, setNotificationOpen } = useAppState()
  return (
    <Card>
      <CardHeader
        title="다음에 할 일"
        action={
          <button type="button" className={styles.headLink} onClick={() => setNotificationOpen(true)}>
            알림 <ChevronRight size={14} aria-hidden="true" />
          </button>
        }
      />
      <ul className={styles.todoList}>
        {nextActions.map(({ itemId, policyId, title, actionLabel }) => (
          <li key={itemId} className={styles.todo}>
            <div className={styles.todoBody}>
              <Link to={`/policies/${policyId}`} className={styles.todoTitle}>{title}</Link>
              <span className={styles.muted}>{actionLabel}</span>
              <StatusSelect value={statuses[itemId]} onChange={(s) => setItemStatus(itemId, s)} />
            </div>
            <Link to={`/policies/${policyId}`} aria-label={`${title} 상세`} className={styles.todoArrow}>
              <ChevronRight size={18} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function UpcomingDeadlines() {
  const policyIds = roadmap.steps.flatMap((s) => s.items).map((i) => i.policyId).filter(Boolean)
  const list = [
    ...policyIds.map(policyById).map((p) => ({ key: `p${p.policyId}`, name: p.title, date: p.applyEndDate })),
    ...jobs.map((j) => ({ key: `j${j.jobId}`, name: `${j.company.replace('(주)', '')} ${j.title}`, date: j.deadline })),
  ]
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <Card>
      <CardHeader title="다가오는 마감" />
      <ul className={styles.deadlines}>
        {list.map((d) => (
          <li key={d.key}>
            <span>{d.name}</span>
            <DdayTag date={d.date} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
