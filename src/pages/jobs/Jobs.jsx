import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, ChevronDown, ChevronRight, ChevronUp, ExternalLink } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import JobFilter from './JobFilter.jsx'
import {
  EDUCATION,
  EMPLOYMENT_TYPE,
  JOB_CATEGORY,
  LIFE_STAGE,
  PREP_PERIOD,
  REGION,
} from '../../constants/enumLabels.js'
import { jobs, policyById, reviews } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatDot } from '../../utils/date.js'
import styles from './Jobs.module.css'

const SORTS = {
  deadline: { label: '마감 임박순', compare: (a, b) => a.deadline.localeCompare(b.deadline) },
  latest: { label: '최신순', compare: (a, b) => b.jobId - a.jobId },
}

export default function Jobs() {
  const { profile, updateProfile } = useAppState()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState('deadline')

  const list = useMemo(
    () =>
      jobs
        .filter((j) => profile.regions.includes(j.region) && profile.jobCategories.includes(j.jobCategory))
        .sort(SORTS[sort].compare),
    [profile.regions, profile.jobCategories, sort],
  )

  const regionLabel =
    profile.regions.length === Object.keys(REGION).length
      ? '시흥·인접지역'
      : profile.regions.map((r) => REGION[r]).join('·')
  const categoryLabel = profile.jobCategories.map((c) => JOB_CATEGORY[c].replace('·개발', '')).join('·')
  const graduating = profile.lifeStages.includes('GRADUATING')

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>맞춤 채용</h1>
        <p className={styles.description}>내 조건에 맞는 공고와 취업 준비에 도움 되는 지원을 함께 확인해요.</p>
        <div className={styles.conditions}>
          {regionLabel && <Tag tone="outline">{regionLabel}</Tag>}
          <Tag tone="outline">{EDUCATION[profile.education]}</Tag>
          <Tag tone="outline">신입</Tag>
          {categoryLabel && <Tag tone="outline">{categoryLabel}</Tag>}
          <Tag tone="outline">{EMPLOYMENT_TYPE.FULL_TIME}</Tag>
          {graduating && <span className={styles.note}>대졸은 {LIFE_STAGE.GRADUATING} 포함</span>}
        </div>
        <button
          type="button"
          className={styles.filterToggle}
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          조건 수정 {filterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {filterOpen && (
          <JobFilter
            regions={profile.regions}
            jobCategories={profile.jobCategories}
            onChange={(patch) => updateProfile(patch)}
          />
        )}
      </header>

      <div className={styles.columns}>
        <section aria-labelledby="job-list-title">
          <div className={styles.listHead}>
            <h2 id="job-list-title" className={styles.listTitle}>
              맞춤 공고 <span>{list.length}</span>
              <small>고용24 채용정보 기준</small>
            </h2>
            <label>
              <span className="sr-only">정렬</span>
              <select className={styles.sort} value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
          <p className={styles.listNote}>공고 확인과 입사 지원은 공식 사이트에서 진행돼요.</p>

          <div className={styles.list}>
            {list.length === 0 && (
              <Card className={styles.empty}>조건에 맞는 공고가 없어요. 조건을 넓혀 보세요.</Card>
            )}
            {list.map((job) => (
              <JobCard key={job.jobId} job={job} />
            ))}
          </div>
        </section>

        <aside className={styles.side}>
          <PassReviews />
          <NewNotifications />
        </aside>
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const { savedJobIds, toggleSavedJob, policyStatus, setPolicyStatus } = useAppState()
  const saved = savedJobIds.has(job.jobId)

  return (
    <Card as="article" className={styles.job}>
      <div className={styles.jobTop}>
        <div>
          <p className={styles.company}>
            {job.company}
            {job.isNew && <span className={styles.new}>NEW</span>}
          </p>
          <h3 className={styles.jobTitle}>{job.title}</h3>
        </div>
        <div className={styles.jobTools}>
          <DdayTag date={job.deadline} />
          <button
            type="button"
            className={styles.bookmark}
            aria-pressed={saved}
            aria-label={saved ? '관심 공고 해제' : '관심 공고 저장'}
            onClick={() => toggleSavedJob(job.jobId)}
          >
            <Bookmark size={20} className={saved ? styles.saved : ''} />
          </button>
        </div>
      </div>

      <div className={styles.jobMid}>
        <p className={styles.jobMeta}>
          {REGION[job.region]} · {EDUCATION[job.education]} · 신입 · {EMPLOYMENT_TYPE[job.employmentType]}
          <span className={styles.divider} aria-hidden="true" />
          {formatDot(job.deadline)} 마감
        </p>
        <Button variant="outline" href={job.applyUrl}>
          공식 사이트 <ExternalLink size={14} aria-hidden="true" />
        </Button>
      </div>

      <div className={styles.support}>
        <p className={styles.supportTitle}>이 공고에 도움 되는 지원</p>
        <ul className={styles.supportList}>
          {job.relatedPolicyIds.map(policyById).map((p) => (
            <li key={p.policyId}>
              <Link to={`/policies/${p.policyId}`} className={styles.supportLink}>
                {p.title} <ChevronRight size={12} aria-hidden="true" />
              </Link>
              <StatusSelect value={policyStatus(p.policyId)} onChange={(s) => setPolicyStatus(p.policyId, s)} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function PassReviews() {
  const list = reviews.filter((r) => r.type === 'PASS_REVIEW')
  return (
    <Card>
      <CardHeader title="같은 상황 청년의 합격 후기" />
      <p className={styles.sideDescription}>먼저 취업을 준비한 청년의 경험이에요.</p>
      <ul className={styles.passList}>
        {list.map((r) => (
          <li key={r.postId}>
            <Link to="/community" className={styles.pass}>
              <span className={styles.passStage}>{r.authorStage}</span>
              <strong>{r.title}</strong>
              <span className={styles.passTags}>
                {r.helpfulPoints.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
              <span className={styles.passMeta}>
                {policyById(r.policyId).title} · 준비 {PREP_PERIOD[r.prepPeriod]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function NewNotifications() {
  const { notifications, setNotificationOpen } = useAppState()
  const unread = notifications.filter((n) => !n.read)
  return (
    <Card>
      <CardHeader
        title="새 알림"
        action={
          <button type="button" className={styles.headLink} onClick={() => setNotificationOpen(true)}>
            알림 <ChevronRight size={14} aria-hidden="true" />
          </button>
        }
      />
      {unread.length === 0 ? (
        <p className={styles.sideDescription}>새 알림이 없어요.</p>
      ) : (
        <ul className={styles.notiList}>
          {unread.slice(0, 3).map((n) => (
            <li key={n.notificationId}>
              <Link to={n.link}>
                {n.title}
                {n.dday && <b className={styles.urgent}>{n.dday}</b>}
              </Link>
              <ArrowRight size={14} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
