import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp, ExternalLink } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import StatusChangeModal from './StatusChangeModal.jsx'
import { INTEREST_FIELD, LIFE_STAGE, RECRUIT_STATUS } from '../../constants/enumLabels.js'
import { roadmapApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatRange } from '../../utils/date.js'
import { toggled } from '../../utils/set.js'
import styles from './Roadmap.module.css'

// 내 로드맵: GET /roadmaps/me(타임라인) + GET /home/summary(다음 할 일·다가오는 마감)
export default function Roadmap() {
  const { profile } = useAppState()
  const [modalOpen, setModalOpen] = useState(false)
  const roadmapQuery = useApi(() => roadmapApi.mine(), [])
  const summaryQuery = useApi(() => roadmapApi.summary(), [])
  const roadmap = roadmapQuery.data

  // 홈에서 단계를 눌러 들어오면 그 단계를 펼친다
  const { state } = useLocation()
  const [openSteps, setOpenSteps] = useState(() => new Set(state?.step ? [state.step] : []))
  const toggleStep = (order) => setOpenSteps((prev) => toggled(prev, order))

  // 진행상태 변경: PATCH 응답의 진행률을 바로 반영하고, 단계 완료·다음 할 일은 다시 불러온다
  const changeStatus = async (itemId, status) => {
    try {
      const res = await roadmapApi.changeStatus(itemId, status)
      roadmapQuery.setData((r) => ({
        ...r,
        progress: res.progress,
        steps: r.steps.map((s) => ({
          ...s,
          items: s.items.map((i) => (i.itemId === itemId ? { ...i, status: res.status } : i)),
        })),
      }))
      roadmapQuery.reload()
      summaryQuery.reload()
      if (res.suggestReview) window.alert('완료했어요! 커뮤니티에 1분 후기를 남겨 보세요.')
    } catch (err) {
      window.alert(err.message)
    }
  }

  if (!roadmap) return <AsyncState loading={roadmapQuery.loading} error={roadmapQuery.error} onRetry={roadmapQuery.reload} />

  const summary = roadmap.progress
  const itemCount = roadmap.steps.reduce((n, s) => n + s.items.length, 0)
  const isOpen = (order) => openSteps.has(order) || (openSteps.size === 0 && order === roadmap.currentStep)

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
            <span className={styles.muted}>완료한 항목 기준</span>
          </div>
        </div>
      </Card>

      <div className={styles.columns}>
        <section aria-labelledby="roadmap-title">
          <div className={styles.sectionHead}>
            <h2 id="roadmap-title" className={styles.sectionTitle}>{roadmap.templateName}</h2>
            <span className={styles.muted}>
              {roadmap.steps.length}단계 · {itemCount}개 항목
            </span>
          </div>

          <ol className={styles.timeline}>
            {roadmap.steps.map((step, index) => {
              const done = step.completed
              const isCurrent = step.stepOrder === roadmap.currentStep
              const open = isOpen(step.stepOrder)
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
                      {step.items.length === 0 && <p className={styles.muted}>아직 담긴 지원이 없어요.</p>}
                      {step.items.map((item) => (
                        <RoadmapItem
                          key={item.itemId}
                          item={item}
                          onStatusChange={(s) => changeStatus(item.itemId, s)}
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
          <NextActions summary={summaryQuery.data} onStatusChange={changeStatus} />
          <UpcomingDeadlines summary={summaryQuery.data} />
          <Link to="/jobs" className={styles.jobsBanner}>
            <span>
              <strong>
                {summaryQuery.data?.newJobCount ? `새 맞춤 공고 ${summaryQuery.data.newJobCount}건` : '맞춤 채용공고'}
              </strong>
              <span>내 조건에 맞는 신입 공고를 확인해 보세요</span>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </aside>
      </div>

      {modalOpen && (
        <StatusChangeModal
          open
          onClose={() => setModalOpen(false)}
          onRenewed={() => {
            setOpenSteps(new Set())
            roadmapQuery.reload()
            summaryQuery.reload()
          }}
        />
      )}
    </div>
  )
}

function RoadmapItem({ item, onStatusChange }) {
  const ended = item.recruitStatus === 'ENDED'
  return (
    <Card as="article" className={styles.itemCard}>
      <div className={styles.itemTop}>
        <h3 className={styles.itemTitle}>{item.title}</h3>
        {ended ? <Tag>{RECRUIT_STATUS.ENDED}</Tag> : <DdayTag dDay={item.dDay} />}
      </div>
      <div className={styles.itemSub}>
        <span>{item.agency}</span>
        <span>
          <span className={styles.muted}>접수</span> {formatRange(item.applyStartDate, item.applyEndDate)}
        </span>
      </div>
      <div className={styles.itemActions}>
        <StatusSelect value={item.status} onChange={onStatusChange} />
        <div className={styles.buttons}>
          <Button variant="outline" to={`/policies/${item.policyId}`}>자세히</Button>
          <Button href={item.applyUrl}>
            공식 사이트 <ExternalLink size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
      {ended && <p className={styles.source}>운영기관이 종료한 정책이에요.</p>}
    </Card>
  )
}

function NextActions({ summary, onStatusChange }) {
  const { setNotificationOpen } = useAppState()
  const list = summary?.nextActions ?? []
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
        {list.map(({ itemId, policyId, title, status, actionLabel }) => (
          <li key={itemId} className={styles.todo}>
            <div className={styles.todoBody}>
              <Link to={`/policies/${policyId}`} className={styles.todoTitle}>{title}</Link>
              <span className={styles.muted}>{actionLabel}</span>
              <StatusSelect value={status} onChange={(s) => onStatusChange(itemId, s)} />
            </div>
            <Link to={`/policies/${policyId}`} aria-label={`${title} 상세`} className={styles.todoArrow}>
              <ChevronRight size={18} />
            </Link>
          </li>
        ))}
        {summary && list.length === 0 && <li className={styles.muted}>지금 할 일이 없어요.</li>}
      </ul>
    </Card>
  )
}

function UpcomingDeadlines({ summary }) {
  const list = summary?.upcomingDeadlines ?? []
  return (
    <Card>
      <CardHeader title="다가오는 마감" />
      <ul className={styles.deadlines}>
        {list.map((d) => (
          <li key={`${d.sourceType}-${d.sourceId}-${d.date}`}>
            {d.sourceType === 'POLICY' ? <Link to={`/policies/${d.sourceId}`}>{d.title}</Link> : <span>{d.title}</span>}
            <DdayTag dDay={d.dDay} />
          </li>
        ))}
        {summary && list.length === 0 && <li className={styles.muted}>2주 안에 마감되는 일정이 없어요.</li>}
      </ul>
    </Card>
  )
}
