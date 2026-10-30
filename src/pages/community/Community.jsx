import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ellipsis, Heart, Pencil } from 'lucide-react'
import Card from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import Toggle from '../../components/Toggle/Toggle.jsx'
import { Chip, Tag } from '../../components/Chip/Chip.jsx'
import { Stars } from '../../components/Stars/Stars.jsx'
import ReviewWriteModal from './ReviewWriteModal.jsx'
import ReportModal from './ReportModal.jsx'
import { JOB_CATEGORY, LIFE_STAGE, POST_TYPE, PREP_PERIOD } from '../../constants/enumLabels.js'
import { policies, policyById, reviews as initialReviews } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatDot } from '../../utils/date.js'
import { toggled } from '../../utils/set.js'
import styles from './Community.module.css'

const SORTS = {
  latest: { label: '작성일 최신순', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  likes: { label: '도움돼요 많은순', compare: (a, b) => b.likeCount - a.likeCount },
}

export default function Community() {
  const { profile, unreadCount, setNotificationOpen } = useAppState()
  const [posts, setPosts] = useState(initialReviews)
  const [tab, setTab] = useState('PROGRAM_REVIEW')
  const [policyFilter, setPolicyFilter] = useState('ALL')
  const [jobFilter, setJobFilter] = useState('ALL')
  const [sameStageOnly, setSameStageOnly] = useState(false)
  const [sort, setSort] = useState('latest')
  const [liked, setLiked] = useState(() => new Set())
  const [writeOpen, setWriteOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)

  const list = useMemo(
    () =>
      posts
        .filter((p) => p.type === tab)
        .filter((p) => policyFilter === 'ALL' || p.policyId === policyFilter)
        .filter((p) => jobFilter === 'ALL' || p.jobCategory === jobFilter)
        .filter((p) => !sameStageOnly || p.lifeStages.some((s) => profile.lifeStages.includes(s)))
        .sort(SORTS[sort].compare),
    [posts, tab, policyFilter, jobFilter, sameStageOnly, sort, profile.lifeStages],
  )

  const resetFilters = () => {
    setPolicyFilter('ALL')
    setJobFilter('ALL')
    setSameStageOnly(false)
  }

  const toggleLike = (postId) => setLiked((prev) => toggled(prev, postId))

  const addReview = (review) => {
    setPosts((prev) => [{ ...review, postId: Date.now(), likeCount: 0 }, ...prev])
    setTab('PROGRAM_REVIEW')
    setWriteOpen(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>커뮤니티</h1>
          <p className={styles.description}>먼저 경험한 청년의 이야기에서 다음 걸음의 힌트를 찾아보세요.</p>
        </div>
        <div className={styles.headActions}>
          <button type="button" className={styles.noti} onClick={() => setNotificationOpen(true)}>
            알림 <span>{unreadCount}</span>
          </button>
          <Button size="lg" onClick={() => setWriteOpen(true)}>
            <Pencil size={16} aria-hidden="true" /> 1분 후기 쓰기
          </Button>
        </div>
      </header>

      <div className={styles.tabs} role="tablist">
        {Object.entries(POST_TYPE).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.columns}>
        <Card as="aside" className={styles.filter}>
          <div className={styles.filterHead}>
            <h2>후기 필터</h2>
            <button type="button" onClick={resetFilters}>초기화</button>
          </div>

          <h3 className={styles.filterLabel}>정책·프로그램</h3>
          <div className={styles.chips}>
            <Chip size="sm" selected={policyFilter === 'ALL'} onClick={() => setPolicyFilter('ALL')}>전체</Chip>
            {policies.map((p) => (
              <Chip
                key={p.policyId}
                size="sm"
                selected={policyFilter === p.policyId}
                onClick={() => setPolicyFilter(p.policyId)}
              >
                {p.title}
              </Chip>
            ))}
          </div>

          <hr className={styles.rule} />
          <h3 className={styles.filterLabel}>직무</h3>
          <div className={styles.chips}>
            <Chip size="sm" selected={jobFilter === 'ALL'} onClick={() => setJobFilter('ALL')}>전체</Chip>
            {Object.entries(JOB_CATEGORY).map(([key, label]) => (
              <Chip key={key} size="sm" selected={jobFilter === key} onClick={() => setJobFilter(key)}>
                {label}
              </Chip>
            ))}
          </div>

          <hr className={styles.rule} />
          <Toggle label="내 상황과 같은 글만 보기" checked={sameStageOnly} onChange={setSameStageOnly} />
          <p className={styles.myStage}>
            내 상황: {profile.lifeStages.map((s) => LIFE_STAGE[s]).join(' · ')}
          </p>
          <p className={styles.privacy}>
            실명과 연락처 없이,
            <br />
            경험과 상황만 나눠요.
          </p>
        </Card>

        <section aria-labelledby="post-list-title">
          <div className={styles.listHead}>
            <h2 id="post-list-title" className={styles.count}>
              {POST_TYPE[tab]} <b>{list.length}</b>개
            </h2>
            <label className={styles.sortLabel}>
              정렬
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {list.length === 0 ? (
            <Card className={styles.empty}>
              <p>조건에 맞는 {POST_TYPE[tab]}가 아직 없어요.</p>
              <Button variant="outline" onClick={() => setWriteOpen(true)}>첫 후기 남기기</Button>
            </Card>
          ) : (
            <div className={styles.grid}>
              {list.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  liked={liked.has(post.postId)}
                  onLike={() => toggleLike(post.postId)}
                  onReport={() => setReportTarget(post)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {writeOpen && <ReviewWriteModal onClose={() => setWriteOpen(false)} onSubmit={addReview} />}
      {reportTarget && <ReportModal post={reportTarget} onClose={() => setReportTarget(null)} />}
    </div>
  )
}

function PostCard({ post, liked, onLike, onReport }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const policy = policyById(post.policyId)

  return (
    <Card as="article" className={styles.post}>
      <div className={styles.postTop}>
        <Stars value={post.rating} size={12} />
        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.more}
            aria-label="더보기"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          >
            <Ellipsis size={18} />
          </button>
          {menuOpen && (
            <button type="button" className={styles.menu} onClick={onReport}>
              후기 신고하기
            </button>
          )}
        </div>
      </div>

      <h3 className={styles.postTitle}>{post.title}</h3>
      <div className={styles.postTags}>
        <span className={styles.prep}>준비 {PREP_PERIOD[post.prepPeriod]}</span>
        {post.helpfulPoints.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <p className={styles.postPolicy}>
        <Link to={`/policies/${policy.policyId}`}>{policy.title}</Link>
        <span> · {JOB_CATEGORY[post.jobCategory].replace('·개발', '')}</span>
      </p>

      <div className={styles.postFoot}>
        <div>
          <p>익명 청년 · {post.authorStage}</p>
          <p className={styles.date}>{formatDot(post.createdAt)}</p>
        </div>
        <button
          type="button"
          className={`${styles.like} ${liked ? styles.liked : ''}`}
          aria-pressed={liked}
          aria-label="도움돼요"
          onClick={onLike}
        >
          <Heart size={14} aria-hidden="true" /> {post.likeCount + (liked ? 1 : 0)}
        </button>
      </div>
    </Card>
  )
}
