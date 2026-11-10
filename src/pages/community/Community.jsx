import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Ellipsis, Heart, MessagesSquare, Pencil } from 'lucide-react'
import PageHead from '../../components/PageHead/PageHead.jsx'
import Card from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import Select from '../../components/Select/Select.jsx'
import Toggle from '../../components/Toggle/Toggle.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Chip, Tag } from '../../components/Chip/Chip.jsx'
import { Stars } from '../../components/Stars/Stars.jsx'
import ReviewWriteModal from './ReviewWriteModal.jsx'
import ReportModal from './ReportModal.jsx'
import { JOB_CATEGORY, LIFE_STAGE, POST_TYPE, PREP_PERIOD, authorStageLabel } from '../../constants/enumLabels.js'
import { policyApi, postApi, roadmapApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatDot } from '../../utils/date.js'
import styles from './Community.module.css'

// GET /posts?sort=
const SORTS = { latest: '작성일 최신순', likes: '도움돼요 많은순' }
const PAGE_SIZE = 50

// 커뮤니티 목록 (GET /posts). 필터·정렬은 서버가 한다
// 정책 상세의 '후기 더 보기'는 /community?policyId=로 들어와 그 정책으로 걸러 보여준다
export default function Community() {
  const { profile } = useAppState()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('PROGRAM_REVIEW')
  const [policyFilter, setPolicyFilter] = useState(() => Number(searchParams.get('policyId')) || 'ALL')
  const [jobFilter, setJobFilter] = useState('ALL')
  const [sameStageOnly, setSameStageOnly] = useState(false)
  const [sort, setSort] = useState('latest')
  const [writeOpen, setWriteOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)

  // 정책 필터: 이 탭에서 후기가 달린 정책만 고를 수 있게 한다 (정책이 수백 건이라 전부 보여주지 않음)
  const reviewedQuery = useApi(() => postApi.list({ type: tab, size: PAGE_SIZE }), [tab])
  const reviewedPolicies = useMemo(() => {
    const map = new Map()
    for (const p of reviewedQuery.data?.content ?? []) if (p.policy) map.set(p.policy.policyId, p.policy.title)
    return [...map].sort((a, b) => a[1].localeCompare(b[1]))
  }, [reviewedQuery.data])

  // 후기 쓰기의 정책 선택: 내 로드맵에 담긴 정책을 먼저, 그다음 지원정보 목록 (GET /roadmaps/me, GET /policies)
  const roadmapQuery = useApi(() => roadmapApi.mine(), [])
  const policyQuery = useApi(() => policyApi.list({ size: 50 }), [])
  const writablePolicies = useMemo(() => {
    const map = new Map()
    for (const step of roadmapQuery.data?.steps ?? []) for (const i of step.items) map.set(i.policyId, i.title)
    // 필터로 보고 있던 정책이 아래 목록(50건)에 없어도 고를 수 있게 후기가 달린 정책도 넣는다
    for (const [policyId, title] of reviewedPolicies) if (!map.has(policyId)) map.set(policyId, title)
    for (const p of policyQuery.data?.content ?? []) if (!map.has(p.policyId)) map.set(p.policyId, p.title)
    return [...map].map(([policyId, title]) => ({ policyId, title }))
  }, [roadmapQuery.data, reviewedPolicies, policyQuery.data])

  const listQuery = useApi(
    () =>
      postApi.list({
        type: tab,
        policyId: policyFilter === 'ALL' ? undefined : policyFilter,
        jobCategory: jobFilter === 'ALL' ? undefined : jobFilter,
        sameStage: sameStageOnly || undefined,
        sort,
        size: PAGE_SIZE,
      }),
    [tab, policyFilter, jobFilter, sameStageOnly, sort],
  )
  const list = listQuery.data?.content ?? []

  const resetFilters = () => {
    setPolicyFilter('ALL')
    setJobFilter('ALL')
    setSameStageOnly(false)
  }

  // POST·DELETE /posts/{id}/likes — 응답의 liked·likeCount로 카드만 바꾼다
  const toggleLike = async (post) => {
    try {
      const res = post.liked ? await postApi.unlike(post.postId) : await postApi.like(post.postId)
      listQuery.setData((d) => ({
        ...d,
        content: d.content.map((p) => (p.postId === res.postId ? { ...p, liked: res.liked, likeCount: res.likeCount } : p)),
      }))
    } catch (err) {
      window.alert(err.message)
    }
  }

  // 쓴 글의 종류 탭으로 옮겨 바로 보이게 한다
  const afterWrite = (type) => {
    setWriteOpen(false)
    if (tab === type) {
      listQuery.reload()
      reviewedQuery.reload()
    } else {
      setTab(type)
    }
  }

  const afterReport = (reported) => {
    setReportTarget(null)
    // 5건이 쌓여 숨겨졌을 수 있어 다시 불러온다
    if (reported) listQuery.reload()
  }

  return (
    <div className={styles.page}>
      <PageHead
        decor="community"
        icon={MessagesSquare}
        title="커뮤니티"
        description="먼저 경험한 청년의 이야기에서 다음 걸음의 힌트를 찾아보세요."
        actions={
          <Button variant="outline" size="lg" onClick={() => setWriteOpen(true)}>
            <Pencil size={16} aria-hidden="true" /> 1분 후기 쓰기
          </Button>
        }
      />

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
          <Select
            label="정책·프로그램"
            className={styles.policySelect}
            value={policyFilter}
            onChange={setPolicyFilter}
            options={[['ALL', '전체'], ...reviewedPolicies]}
          />

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
              {POST_TYPE[tab]} <b>{listQuery.data?.totalElements ?? 0}</b>개
            </h2>
            <div className={styles.sortLabel}>
              <span aria-hidden="true">정렬</span>
              <Select
                label="정렬"
                className={styles.sortSelect}
                value={sort}
                onChange={setSort}
                options={Object.entries(SORTS)}
              />
            </div>
          </div>

          {!listQuery.data ? (
            <AsyncState loading={listQuery.loading} error={listQuery.error} onRetry={listQuery.reload} />
          ) : list.length === 0 ? (
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
                  onLike={() => toggleLike(post)}
                  onReport={() => setReportTarget(post)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {writeOpen && (
        <ReviewWriteModal
          policies={writablePolicies}
          initialPolicyId={policyFilter === 'ALL' ? undefined : policyFilter}
          initialType={tab}
          onClose={() => setWriteOpen(false)}
          onSubmit={afterWrite}
        />
      )}
      {reportTarget && <ReportModal post={reportTarget} onClose={afterReport} />}
    </div>
  )
}

function PostCard({ post, onLike, onReport }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { policy, liked } = post

  return (
    <Card as="article" className={styles.post}>
      <div className={styles.postTop}>
        {post.rating ? <Stars value={post.rating} size={12} /> : <span />}
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

      <h3 className={styles.postTitle}>
        <Link to={`/community/${post.postId}`}>{post.oneLiner}</Link>
      </h3>
      <div className={styles.postTags}>
        <span className={styles.prep}>준비 {PREP_PERIOD[post.prepPeriod]}</span>
        {post.helpfulPoints.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <p className={styles.postPolicy}>
        {policy && <Link to={`/policies/${policy.policyId}`}>{policy.title}</Link>}
        {post.job && !policy && <Link to={`/jobs/${post.job.jobId}`}>{post.job.company}</Link>}
        {post.jobCategory && (
          <span>
            {policy || post.job ? ' · ' : ''}
            {JOB_CATEGORY[post.jobCategory].replace('·개발', '')}
          </span>
        )}
      </p>

      <div className={styles.postFoot}>
        <div>
          <p>익명 청년 · {authorStageLabel(post)}</p>
          <p className={styles.date}>{formatDot(post.createdAt)}</p>
        </div>
        <button
          type="button"
          className={`${styles.like} ${liked ? styles.liked : ''}`}
          aria-pressed={liked}
          aria-label="도움돼요"
          onClick={onLike}
        >
          <Heart size={14} aria-hidden="true" /> {post.likeCount}
        </button>
      </div>
    </Card>
  )
}
