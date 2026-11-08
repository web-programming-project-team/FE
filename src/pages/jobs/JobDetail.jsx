import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bookmark, BookmarkCheck, ChevronRight, ExternalLink } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Stars } from '../../components/Stars/Stars.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import { EDUCATION, EMPLOYMENT_TYPE, JOB_CATEGORY, REGION } from '../../constants/enumLabels.js'
import { jobApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { ddayLabel, formatDot } from '../../utils/date.js'
import { changeHelpfulStatus } from './jobActions.js'
import styles from '../policy/PolicyDetail.module.css'

const SOURCE_LABEL = { JOBABA: '잡아바(경기도일자리재단)', ADMIN: 'NEXT 시흥 등록' }

// 채용공고 상세 (GET /jobs/{jobId}). 시안이 없어 정책 상세와 같은 구성으로 만든다
// 관심 저장하면 마감일이 캘린더에 JOB_DEADLINE으로 들어가고, 해제하면 함께 지워진다
export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { data: job, loading, error, reload, setData } = useApi(() => jobApi.detail(jobId), [jobId])
  const [busy, setBusy] = useState(false)

  if (!job) {
    if (error?.code === 'JOB_NOT_FOUND') {
      return (
        <Card className={styles.empty}>
          <p>채용공고를 찾을 수 없습니다.</p>
          <Button variant="outline" to="/jobs">맞춤 채용으로</Button>
        </Card>
      )
    }
    return <AsyncState loading={loading} error={error} onRetry={reload} />
  }

  const toggleBookmark = async () => {
    setBusy(true)
    try {
      if (job.bookmarked) {
        await jobApi.unbookmark(job.jobId)
      } else {
        const res = await jobApi.bookmark(job.jobId)
        if (res.calendarEventId) window.alert('관심 공고에 저장하고 마감일을 캘린더에 넣었어요.')
      }
      setData((j) => ({ ...j, bookmarked: !j.bookmarked }))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (policy, status) => {
    try {
      const next = await changeHelpfulStatus(policy, status)
      setData((j) => ({
        ...j,
        helpfulPolicies: j.helpfulPolicies.map((p) => (p.policyId === policy.policyId ? { ...p, myStatus: next } : p)),
      }))
    } catch (err) {
      window.alert(err.message)
    }
  }

  const closed = job.dDay !== null && job.dDay < 0
  const info = [
    ['근무지역', job.address ? `${REGION[job.region]} · ${job.address}` : REGION[job.region]],
    ['학력', EDUCATION[job.education]],
    ['경력', '신입'],
    ['고용형태', EMPLOYMENT_TYPE[job.employmentType]],
    ['직무', JOB_CATEGORY[job.jobCategory]],
    ['급여', job.salary ?? '-'],
    ['마감일', job.deadline ? formatDot(job.deadline) : '상시채용'],
  ]

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} aria-hidden="true" /> 뒤로가기
      </button>

      <header className={styles.head}>
        <div className={styles.titleRow}>
          <Tag>{JOB_CATEGORY[job.jobCategory]}</Tag>
          <h1 className={styles.title}>{job.title}</h1>
        </div>
        <p className={styles.org}>
          {job.company} · {REGION[job.region]}
        </p>
      </header>

      <div className={styles.columns}>
        <div className={styles.main}>
          <Card>
            <CardHeader title="공고 안내" />
            <dl className={styles.info}>
              {info.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.sourceBox}>
              <p>출처 {SOURCE_LABEL[job.dataSource] ?? job.dataSource}</p>
              <a href={job.originalUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                공고 원문 확인 <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </Card>

          {job.helpfulPolicies.length > 0 && (
            <section>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>이 공고에 도움 되는 지원</h2>
              </div>
              <div className={styles.jobs}>
                {job.helpfulPolicies.map((p) => (
                  <Card as="article" key={p.policyId} className={styles.job}>
                    <h3 className={styles.jobTitle}>
                      <Link to={`/policies/${p.policyId}`}>
                        {p.title} <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    </h3>
                    <div className={styles.jobMeta}>
                      <span>내 진행상태</span>
                      <StatusSelect value={p.myStatus ?? 'TO_CHECK'} onChange={(s) => changeStatus(p, s)} />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>같은 직무 합격 후기</h2>
              <Link to="/community" className={styles.more}>
                커뮤니티 <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
            {job.reviews.length === 0 ? (
              <Card className={styles.empty}>아직 이 직무의 합격 후기가 없어요.</Card>
            ) : (
              <div className={styles.reviews}>
                {job.reviews.map((r) => (
                  <Card as="article" key={r.postId} className={styles.review}>
                    <Stars value={r.rating} />
                    <h3 className={styles.reviewTitle}>
                      <Link to={`/community/${r.postId}`}>{r.oneLiner}</Link>
                    </h3>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <Card as="aside" className={styles.side}>
          <div className={styles.dday}>
            <p className={styles.muted}>접수 마감까지</p>
            <strong>{ddayLabel(job.dDay)}</strong>
            <p>
              <span className={styles.muted}>마감일</span> {job.deadline ? formatDot(job.deadline) : '상시채용'}
            </p>
          </div>

          <div className={styles.sideActions}>
            <Button href={job.originalUrl} size="lg" block>
              공식 사이트에서 지원 <ExternalLink size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              block
              aria-pressed={job.bookmarked}
              disabled={busy || (closed && !job.bookmarked)}
              onClick={toggleBookmark}
            >
              {job.bookmarked ? (
                <>
                  <BookmarkCheck size={16} aria-hidden="true" /> 관심 공고 해제
                </>
              ) : (
                <>
                  <Bookmark size={16} aria-hidden="true" /> 관심 공고 저장
                </>
              )}
            </Button>
            {job.deadline && (
              <p className={styles.calendarHint}>
                {job.bookmarked ? '마감일이 NEXT 캘린더에 들어가 있어요' : '저장하면 마감일이 NEXT 캘린더에 들어가요'}
              </p>
            )}
          </div>

          <p className={styles.notice}>
            지원은 공식 사이트에서 진행돼요
            <br />
            지원 자격과 마감일을 꼭 확인해 주세요.
          </p>
        </Card>
      </div>
    </div>
  )
}
