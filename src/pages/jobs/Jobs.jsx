import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import Card, { CardHeader } from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import JobFilter from './JobFilter.jsx'
import {
  EDUCATION,
  EMPLOYMENT_TYPE,
  JOB_CATEGORY,
  LIFE_STAGE,
  authorStageLabel,
  PREP_PERIOD,
  REGION,
} from '../../constants/enumLabels.js'
import { jobApi } from '../../api/index.js'
import { reviews } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatDot } from '../../utils/date.js'
import { notificationPath, splitDday } from '../../utils/notification.js'
import { changeHelpfulStatus, withPolicyStatus } from './jobActions.js'
import styles from './Jobs.module.css'

// 맞춤 채용 (GET /jobs/recommended) + 관심 공고 (GET /jobs/bookmarks)
// 필터·정렬은 서버가 저장된 채용 조건으로 한다. 조건을 바꾸면 PATCH 후 목록을 다시 받는다
const SORTS = { deadline: '마감 임박순', latest: '최신순' }
const PAGE_SIZE = 20

export default function Jobs() {
  const { profile, updateJobPreference } = useAppState()
  // 온보딩에서는 지역·직무만 받으므로 학력·고용형태는 비어 있을 수 있다(null·빈 목록)
  const { regions, jobCategories, education, employmentTypes } = profile.jobPreference
  const [filterOpen, setFilterOpen] = useState(false)
  const [tab, setTab] = useState('recommended')
  const [sort, setSort] = useState('deadline')
  const [bookmarkCount, setBookmarkCount] = useState(null)

  const regionLabel =
    regions.length === Object.keys(REGION).length
      ? '시흥·인접지역'
      : regions.map((r) => REGION[r]).join('·')
  const categoryLabel = jobCategories.map((c) => JOB_CATEGORY[c].replace('·개발', '')).join('·')
  const employmentLabel = employmentTypes.map((t) => EMPLOYMENT_TYPE[t]).join('·')
  const graduating = profile.lifeStages.includes('GRADUATING')

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>맞춤 채용</h1>
        <p className={styles.description}>내 조건에 맞는 공고와 취업 준비에 도움 되는 지원을 함께 확인해요.</p>
        <div className={styles.conditions}>
          {regionLabel && <Tag tone="outline">{regionLabel}</Tag>}
          {education && <Tag tone="outline">{EDUCATION[education]}</Tag>}
          <Tag tone="outline">신입</Tag>
          {categoryLabel && <Tag tone="outline">{categoryLabel}</Tag>}
          {employmentLabel && <Tag tone="outline">{employmentLabel}</Tag>}
          {graduating && education === 'UNIVERSITY' && (
            <span className={styles.note}>대졸은 {LIFE_STAGE.GRADUATING} 포함</span>
          )}
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
            regions={regions}
            jobCategories={jobCategories}
            education={education}
            employmentTypes={employmentTypes}
            // PATCH /users/me/job-preference (보낸 필드만 바뀜) → profile이 바뀌면 목록을 다시 받는다
            onChange={(patch) => updateJobPreference(patch).catch((err) => window.alert(err.message))}
          />
        )}
      </header>

      <div className={styles.columns}>
        <section aria-label="채용공고">
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'recommended'}
              className={`${styles.tab} ${tab === 'recommended' ? styles.tabActive : ''}`}
              onClick={() => setTab('recommended')}
            >
              맞춤 공고
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'bookmarks'}
              className={`${styles.tab} ${tab === 'bookmarks' ? styles.tabActive : ''}`}
              onClick={() => setTab('bookmarks')}
            >
              관심 공고 {bookmarkCount !== null && <span>{bookmarkCount}</span>}
            </button>
          </div>

          {tab === 'recommended' ? (
            <RecommendedList
              sort={sort}
              onSortChange={setSort}
              preferenceKey={JSON.stringify(profile.jobPreference)}
            />
          ) : (
            <BookmarkList onCount={setBookmarkCount} />
          )}
        </section>

        <aside className={styles.side}>
          <PassReviews />
          <NewNotifications />
        </aside>
      </div>
    </div>
  )
}

// 페이지를 이어 붙이는 목록. sort·조건이 바뀌면 처음부터 다시 받는다
function usePagedList(fetchPage, deps) {
  const [state, setState] = useState({ items: [], page: 0, hasNext: false, total: 0, loading: true, error: null })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetchPage, deps)

  const loadPage = useCallback(
    async (page) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const res = await load(page)
        setState((s) => ({
          items: page === 0 ? res.content : [...s.items, ...res.content],
          page: res.page,
          hasNext: res.hasNext,
          total: res.totalElements,
          loading: false,
          error: null,
        }))
      } catch (error) {
        setState((s) => ({ ...s, loading: false, error }))
      }
    },
    [load],
  )

  useEffect(() => {
    loadPage(0)
  }, [loadPage])

  const setItems = useCallback((update) => setState((s) => ({ ...s, items: update(s.items) })), [])
  return { ...state, reload: () => loadPage(0), loadMore: () => loadPage(state.page + 1), setItems, setState }
}

function RecommendedList({ sort, onSortChange, preferenceKey }) {
  const list = usePagedList((page) => jobApi.recommended({ sort, page, size: PAGE_SIZE }), [sort, preferenceKey])

  const toggleBookmark = async (job) => {
    try {
      if (job.bookmarked) await jobApi.unbookmark(job.jobId)
      else await jobApi.bookmark(job.jobId)
      list.setItems((items) => items.map((j) => (j.jobId === job.jobId ? { ...j, bookmarked: !j.bookmarked } : j)))
    } catch (err) {
      window.alert(err.message)
    }
  }

  const changeStatus = async (policy, status) => {
    try {
      const next = await changeHelpfulStatus(policy, status)
      list.setItems((items) => withPolicyStatus(items, policy.policyId, next))
    } catch (err) {
      window.alert(err.message)
    }
  }

  return (
    <>
      <div className={styles.listHead}>
        <h2 className={styles.listTitle}>
          맞춤 공고 <span>{list.total}</span>
          <small>잡아바·관리자 등록 공고 기준</small>
        </h2>
        <label>
          <span className="sr-only">정렬</span>
          <select className={styles.sort} value={sort} onChange={(e) => onSortChange(e.target.value)}>
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={styles.listNote}>공고 확인과 입사 지원은 공식 사이트에서 진행돼요.</p>

      <div className={styles.list}>
        {!list.loading && !list.error && list.items.length === 0 && (
          <Card className={styles.empty}>조건에 맞는 공고가 없어요. 조건을 넓혀 보세요.</Card>
        )}
        {list.items.map((job) => (
          <JobCard key={job.jobId} job={job} onToggleBookmark={toggleBookmark} onChangeStatus={changeStatus} />
        ))}
        <AsyncState loading={list.loading} error={list.error} onRetry={list.reload} />
        {list.hasNext && !list.loading && (
          <Button variant="outline" block onClick={list.loadMore}>
            더 보기
          </Button>
        )}
      </div>
    </>
  )
}

function JobCard({ job, onToggleBookmark, onChangeStatus }) {
  return (
    <Card as="article" className={styles.job}>
      <div className={styles.jobTop}>
        <div>
          <p className={styles.company}>
            {job.company}
            {job.isNew && <span className={styles.new}>NEW</span>}
          </p>
          <h3 className={styles.jobTitle}>
            <Link to={`/jobs/${job.jobId}`} className={styles.jobLink}>{job.title}</Link>
          </h3>
        </div>
        <div className={styles.jobTools}>
          <DdayTag dDay={job.dDay} />
          <button
            type="button"
            className={styles.bookmark}
            aria-pressed={job.bookmarked}
            aria-label={job.bookmarked ? '관심 공고 해제' : '관심 공고 저장'}
            onClick={() => onToggleBookmark(job)}
          >
            <Bookmark size={20} className={job.bookmarked ? styles.saved : ''} />
          </button>
        </div>
      </div>

      <div className={styles.jobMid}>
        <p className={styles.jobMeta}>
          {REGION[job.region]} · {EDUCATION[job.education]} · 신입 · {EMPLOYMENT_TYPE[job.employmentType]}
          <span className={styles.divider} aria-hidden="true" />
          {job.deadline ? `${formatDot(job.deadline)} 마감` : '상시채용'}
        </p>
        <Button variant="outline" to={`/jobs/${job.jobId}`}>
          자세히 <ChevronRight size={14} aria-hidden="true" />
        </Button>
      </div>

      {job.helpfulPolicies.length > 0 && (
        <div className={styles.support}>
          <p className={styles.supportTitle}>이 공고에 도움 되는 지원</p>
          <ul className={styles.supportList}>
            {job.helpfulPolicies.map((p) => (
              <li key={p.policyId}>
                <Link to={`/policies/${p.policyId}`} className={styles.supportLink}>
                  {p.title} <ChevronRight size={12} aria-hidden="true" />
                </Link>
                <StatusSelect value={p.myStatus ?? 'TO_CHECK'} onChange={(s) => onChangeStatus(p, s)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

// 관심 공고: 접수 중인 공고를 마감 임박순, 마감된 공고는 뒤에 '마감'으로
function BookmarkList({ onCount }) {
  const list = usePagedList((page) => jobApi.bookmarks({ page, size: PAGE_SIZE }), [])

  useEffect(() => {
    if (!list.loading && !list.error) onCount(list.total)
  }, [list.loading, list.error, list.total, onCount])

  const remove = async (jobId) => {
    try {
      await jobApi.unbookmark(jobId)
      list.setState((s) => ({ ...s, items: s.items.filter((j) => j.jobId !== jobId), total: s.total - 1 }))
    } catch (err) {
      window.alert(err.message)
    }
  }

  return (
    <>
      <div className={styles.listHead}>
        <h2 className={styles.listTitle}>
          관심 공고 <span>{list.total}</span>
          <small>저장하면 마감일이 NEXT 캘린더에 들어가요</small>
        </h2>
      </div>
      <div className={styles.list}>
        {!list.loading && !list.error && list.items.length === 0 && (
          <Card className={styles.empty}>저장한 공고가 없어요. 맞춤 공고에서 북마크를 눌러 보세요.</Card>
        )}
        {list.items.map((job) => (
          <Card as="article" key={job.jobId} className={`${styles.job} ${job.closed ? styles.closedJob : ''}`}>
            <div className={styles.jobTop}>
              <div>
                <p className={styles.company}>{job.company}</p>
                <h3 className={styles.jobTitle}>
                  <Link to={`/jobs/${job.jobId}`} className={styles.jobLink}>{job.title}</Link>
                </h3>
              </div>
              <div className={styles.jobTools}>
                {job.closed ? <Tag>마감</Tag> : <DdayTag dDay={job.dDay} />}
                <button
                  type="button"
                  className={styles.bookmark}
                  aria-pressed="true"
                  aria-label="관심 공고 해제"
                  onClick={() => remove(job.jobId)}
                >
                  <Bookmark size={20} className={styles.saved} />
                </button>
              </div>
            </div>
            <p className={styles.jobMeta}>{job.deadline ? `${formatDot(job.deadline)} 마감` : '상시채용'}</p>
          </Card>
        ))}
        <AsyncState loading={list.loading} error={list.error} onRetry={list.reload} />
        {list.hasNext && !list.loading && (
          <Button variant="outline" block onClick={list.loadMore}>
            더 보기
          </Button>
        )}
      </div>
    </>
  )
}

// 커뮤니티 담당 화면이 API로 바뀌기 전까지 예시 후기를 보여준다
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
              <span className={styles.passStage}>{authorStageLabel(r)}</span>
              <strong>{r.oneLiner}</strong>
              <span className={styles.passTags}>
                {r.helpfulPoints.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
              <span className={styles.passMeta}>
                {r.policy.title} · 준비 {PREP_PERIOD[r.prepPeriod]}
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
          {unread.slice(0, 3).map((n) => {
            const [text, dday] = splitDday(n.title)
            return (
              <li key={n.notificationId}>
                <Link to={notificationPath(n.link)}>
                  {text}
                  {dday && <b className={styles.urgent}>{dday}</b>}
                </Link>
                <ArrowRight size={14} aria-hidden="true" />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
