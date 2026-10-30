import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, CalendarPlus, ChevronRight, ExternalLink } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import { Stars } from '../../components/Stars/Stars.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import { EMPLOYMENT_TYPE, INTEREST_FIELD, PREP_PERIOD, REGION } from '../../constants/enumLabels.js'
import { jobs, policyById, reviews } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { daysUntil, ddayLabel, formatDot, formatRange, parseDate } from '../../utils/date.js'
import styles from './PolicyDetail.module.css'

export default function PolicyDetail() {
  const { policyId } = useParams()
  const navigate = useNavigate()
  const { policyStatus, setPolicyStatus, calendarPolicyIds, addPolicyToCalendar } = useAppState()
  const policy = policyById(policyId)

  if (!policy) {
    return (
      <Card className={styles.empty}>
        <p>정책을 찾을 수 없습니다.</p>
        <Button variant="outline" to="/">내 로드맵으로</Button>
      </Card>
    )
  }

  const end = parseDate(policy.applyEnd)
  const inCalendar = calendarPolicyIds.has(policy.policyId)
  const relatedReviews = reviews.filter((r) => r.policyId === policy.policyId).slice(0, 3)
  const relatedJobs = jobs.filter((j) => j.relatedPolicyIds.includes(policy.policyId)).slice(0, 2)

  const info = [
    ['지원대상', policy.target],
    ['지원내용', policy.content],
    ['접수기간', formatRange(policy.applyStart, policy.applyEnd)],
    ['운영기관', policy.organization],
    ['문의처', policy.contact],
  ]

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
        <p className={styles.org}>{policy.organization}</p>
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
                마지막 정보 확인일 {formatDot(policy.lastCheckedAt)} · 출처 {policy.sourceName}
              </p>
              <a href={policy.applyUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                공식 출처 확인 <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </Card>

          {relatedReviews.length > 0 && (
            <section>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>먼저 참여한 청년의 후기</h2>
                <Link to="/community" className={styles.more}>
                  후기 더 보기 <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.reviews}>
                {relatedReviews.map((r) => (
                  <Card as="article" key={r.postId} className={styles.review}>
                    <Stars value={r.rating} />
                    <h3 className={styles.reviewTitle}>{r.title}</h3>
                    <p className={styles.reviewMeta}>
                      준비 기간 <b>{PREP_PERIOD[r.prepPeriod]}</b>
                    </p>
                    <p className={styles.reviewDate}>{formatDot(r.createdAt)} 작성</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {relatedJobs.length > 0 && (
            <section>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>이 프로그램과 연결된 채용공고</h2>
              </div>
              <div className={styles.jobs}>
                {relatedJobs.map((j) => (
                  <Card as="article" key={j.jobId} className={styles.job}>
                    <h3 className={styles.jobTitle}>
                      {j.company} · {j.title}
                    </h3>
                    <div className={styles.jobMeta}>
                      <span>
                        {REGION[j.region]} · 신입 · {EMPLOYMENT_TYPE[j.employmentType]}
                      </span>
                      <DdayTag date={j.deadline} />
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
            <StatusSelect
              value={policyStatus(policy.policyId)}
              onChange={(s) => setPolicyStatus(policy.policyId, s)}
            />
          </div>

          <div className={styles.dday}>
            <p className={styles.muted}>접수 마감까지</p>
            <strong>{ddayLabel(daysUntil(policy.applyEnd))}</strong>
            <p>
              <span className={styles.muted}>마감일</span> {formatDot(policy.applyEnd)}
            </p>
          </div>

          <div className={styles.sideActions}>
            <Button href={policy.applyUrl} size="lg" block>
              공식 사이트에서 신청 <ExternalLink size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              block
              disabled={inCalendar}
              onClick={() => addPolicyToCalendar(policy.policyId)}
            >
              {inCalendar ? (
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
              {end.getMonth() + 1}월 {end.getDate()}일 마감 일정을 {inCalendar ? '저장했어요' : '저장해요'}
            </p>
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
