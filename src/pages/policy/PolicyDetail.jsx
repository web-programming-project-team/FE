import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, CalendarPlus, ChevronRight, ExternalLink } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Stars } from '../../components/Stars/Stars.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, PREP_PERIOD, RECRUIT_STATUS } from '../../constants/enumLabels.js'
import { calendarApi, policyApi, roadmapApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { ddayLabel, formatDot, formatRange, parseDate } from '../../utils/date.js'
import styles from './PolicyDetail.module.css'

// 정책·프로그램 상세 (GET /policies/{policyId})
// 진행상태: 로드맵에 없으면 POST /roadmaps/me/items, 있으면 PATCH /roadmap-items/{itemId}/status
export default function PolicyDetail() {
  const { policyId } = useParams()
  const navigate = useNavigate()
  const { data: policy, loading, error, reload, setData } = useApi(() => policyApi.detail(policyId), [policyId])
  const [inCalendar, setInCalendar] = useState(false)
  const [busy, setBusy] = useState(false)

  // 직접 추가한 마감 일정이 이미 있는지 (마감일이 있는 달의 일정에서 찾는다)
  useEffect(() => {
    if (!policy?.applyEndDate || policy.myItem) return
    const end = parseDate(policy.applyEndDate)
    calendarApi
      .monthly(end.getFullYear(), end.getMonth() + 1)
      .then((events) =>
        setInCalendar(events.some((e) => e.sourceType === 'POLICY' && e.sourceId === policy.policyId && e.type === 'APPLY_END')),
      )
      .catch(() => {})
  }, [policy?.policyId, policy?.applyEndDate, policy?.myItem])

  if (!policy) {
    if (error?.code === 'POLICY_NOT_FOUND') {
      return (
        <Card className={styles.empty}>
          <p>정책을 찾을 수 없습니다.</p>
          <Button variant="outline" to="/roadmap">내 로드맵으로</Button>
        </Card>
      )
    }
    return <AsyncState loading={loading} error={error} onRetry={reload} />
  }

  const ended = policy.recruitStatus === 'ENDED'
  // 로드맵에 담긴 정책은 접수 일정이 이미 캘린더에 자동으로 들어가 있다
  const calendarDone = Boolean(policy.myItem) || inCalendar

  const changeStatus = async (status) => {
    setBusy(true)
    try {
      if (policy.myItem) {
        const res = await roadmapApi.changeStatus(policy.myItem.itemId, status)
        setData((p) => ({ ...p, myItem: { itemId: res.itemId, status: res.status } }))
        if (res.suggestReview) window.alert('완료했어요! 커뮤니티에 1분 후기를 남겨 보세요.')
      } else {
        const res = await roadmapApi.addItem(policy.policyId, status)
        setData((p) => ({ ...p, myItem: { itemId: res.itemId, status: res.status } }))
        window.alert(`내 로드맵 ${res.stepOrder}단계에 담았어요. 접수 일정도 캘린더에 넣었어요.`)
      }
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // 로드맵에 없는 정책의 마감일만 직접 일정으로 저장 (POST /calendar/events)
  const addToCalendar = async () => {
    try {
      await calendarApi.create({
        type: 'APPLY_END',
        date: policy.applyEndDate,
        title: `${policy.title} 접수 마감`,
        policyId: policy.policyId,
      })
      setInCalendar(true)
    } catch (err) {
      window.alert(err.message)
    }
  }

  const info = [
    ['지원대상', policy.target],
    ['지원내용', policy.content],
    ['접수기간', formatRange(policy.applyStartDate, policy.applyEndDate)],
    ['운영기관', policy.agency],
    ['문의처', policy.contact ?? '-'],
  ]
  const end = policy.applyEndDate ? parseDate(policy.applyEndDate) : null

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} aria-hidden="true" /> 뒤로가기
      </button>

      <header className={styles.head}>
        <div className={styles.titleRow}>
          <Tag>{INTEREST_FIELD[policy.field]}</Tag>
          <h1 className={styles.title}>{policy.title}</h1>
        </div>
        <p className={styles.org}>
          {policy.agency} · {RECRUIT_STATUS[policy.recruitStatus]}
        </p>
      </header>

      <div className={styles.columns}>
        <div className={styles.main}>
          <Card>
            <CardHeader title="프로그램 안내" />
            <dl className={styles.info}>
              {info.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.sourceBox}>
              <p>
                마지막 정보 확인일 {formatDot(policy.lastVerifiedAt)} · 출처 {policy.agency}
              </p>
              <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                공식 출처 확인 <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </Card>

          {policy.reviews.length > 0 && (
            <section>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>먼저 참여한 청년의 후기</h2>
                <Link to="/community" className={styles.more}>
                  후기 더 보기 <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.reviews}>
                {policy.reviews.map((r) => (
                  <Card as="article" key={r.postId} className={styles.review}>
                    <Stars value={r.rating} />
                    <h3 className={styles.reviewTitle}>{r.oneLiner}</h3>
                    <p className={styles.reviewMeta}>
                      준비 기간 <b>{PREP_PERIOD[r.prepPeriod]}</b>
                    </p>
                    <p className={styles.reviewDate}>{formatDot(r.createdAt)} 작성</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {policy.relatedJobs.length > 0 && (
            <section>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>이 프로그램과 연결된 채용공고</h2>
              </div>
              <div className={styles.jobs}>
                {policy.relatedJobs.map((j) => (
                  <Card as="article" key={j.jobId} className={styles.job}>
                    <h3 className={styles.jobTitle}>
                      <Link to={`/jobs/${j.jobId}`}>
                        {j.company} · {j.title}
                      </Link>
                    </h3>
                    <div className={styles.jobMeta}>
                      <span>신입</span>
                      <DdayTag dDay={j.dDay} />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <Card as="aside" className={styles.side}>
          <div className={styles.statusRow}>
            <h2 className={styles.sideTitle}>내 진행상태</h2>
            {ended && !policy.myItem ? (
              <Tag>{RECRUIT_STATUS.ENDED}</Tag>
            ) : (
              <StatusSelect
                value={policy.myItem?.status ?? 'TO_CHECK'}
                onChange={busy ? undefined : changeStatus}
              />
            )}
          </div>
          {!policy.myItem && !ended && (
            <p className={styles.calendarHint}>상태를 고르면 내 로드맵에 담겨요.</p>
          )}

          <div className={styles.dday}>
            <p className={styles.muted}>접수 마감까지</p>
            <strong>{ddayLabel(policy.dDay)}</strong>
            <p>
              <span className={styles.muted}>마감일</span> {policy.applyEndDate ? formatDot(policy.applyEndDate) : '상시 모집'}
            </p>
          </div>

          <div className={styles.sideActions}>
            <Button href={policy.applyUrl} size="lg" block>
              공식 사이트에서 신청 <ExternalLink size={16} aria-hidden="true" />
            </Button>
            {end && (
              <>
                <Button variant="outline" size="lg" block disabled={calendarDone} onClick={addToCalendar}>
                  {calendarDone ? (
                    <>
                      <CalendarCheck size={16} aria-hidden="true" /> 캘린더에 추가됨
                    </>
                  ) : (
                    <>
                      <CalendarPlus size={16} aria-hidden="true" /> 캘린더에 추가
                    </>
                  )}
                </Button>
                <p className={styles.calendarHint}>
                  {end.getMonth() + 1}월 {end.getDate()}일 마감 일정을 {calendarDone ? '저장했어요' : '저장해요'}
                </p>
              </>
            )}
          </div>

          <p className={styles.notice}>
            신청은 공식 사이트에서 진행돼요
            <br />
            지원 조건과 준비 서류를 꼭 확인해 주세요.
          </p>
        </Card>
      </div>
    </div>
  )
}
