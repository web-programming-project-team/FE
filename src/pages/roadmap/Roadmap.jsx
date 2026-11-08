import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, ChevronDown, ChevronRight, ChevronUp, ExternalLink, Route } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Collapse from '../../components/Collapse/Collapse.jsx'
import PageHead from '../../components/PageHead/PageHead.jsx'
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

  // 펼친 단계: 처음엔 현재 단계(홈에서 단계를 눌러 들어오면 그 단계)만, 이후로는 누른 대로만 바뀐다.
  // 항목을 완료해 현재 단계가 넘어가면 보던 단계는 그대로 두고 새 현재 단계를 함께 펼친다
  const { state } = useLocation()
  const [openSteps, setOpenSteps] = useState(new Set())
  const [seenCurrent, setSeenCurrent] = useState(undefined)   // 아직 못 본 상태는 undefined (모두 완료하면 currentStep이 null일 수 있음)
  if (roadmap && roadmap.currentStep !== seenCurrent) {
    const first = seenCurrent === undefined
    setSeenCurrent(roadmap.currentStep)
    setOpenSteps((prev) => new Set(prev).add(first ? (state?.step ?? roadmap.currentStep) : roadmap.currentStep))
  }
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

  return (
    <div className={styles.page}>
      <PageHead
        icon={Route}
        quiet
        title="내 로드맵"
        description={`${profile.nickname}님, 다음 걸음을 준비해요.`}
        actions={
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
        }
      />

      <div className={styles.columns}>
        <div className={styles.main}>
          {/* 내 상황: 로드맵을 만든 기준. 바꾸면 새 로드맵을 만든다 */}
          <div className={styles.situation}>
            <dl className={styles.situationList}>
              <div>
                <dt>현재 상황</dt>
                <dd className={styles.stages}>
                  {profile.lifeStages.map((s) => (
                    <span key={s}>{LIFE_STAGE[s]}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>관심분야</dt>
                <dd className={styles.interests}>
                  {profile.interests.map((f) => (
                    <span key={f}>{INTEREST_FIELD[f]}</span>
                  ))}
                </dd>
              </div>
            </dl>
            <button type="button" className={styles.changeLink} onClick={() => setModalOpen(true)}>
              상황 바꾸기 <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>

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

                    <Collapse open={open} className={styles.items}>
                      {step.items.length === 0 && <p className={styles.muted}>아직 담긴 지원이 없어요.</p>}
                      {step.items.map((item) => (
                        <RoadmapItem
                          key={item.itemId}
                          item={item}
                          onStatusChange={(s) => changeStatus(item.itemId, s)}
                        />
                      ))}
                    </Collapse>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <aside className={styles.side}>
          <NextActions summary={summaryQuery.data} onStatusChange={changeStatus} />
          <UpcomingDeadlines summary={summaryQuery.data} />
        </aside>
      </div>

      {modalOpen && (
        <StatusChangeModal
          open
          onClose={() => setModalOpen(false)}
          onRenewed={() => {
            setOpenSteps(new Set())
            setSeenCurrent(undefined)
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
          <Button variant="accent" href={item.applyUrl}>
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
