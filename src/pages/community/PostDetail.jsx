import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExternalLink, Heart } from 'lucide-react'
import Card from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Stars } from '../../components/Stars/Stars.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import ReportModal from './ReportModal.jsx'
import { JOB_CATEGORY, POST_TYPE, PREP_PERIOD, authorStageLabel } from '../../constants/enumLabels.js'
import { postApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { formatDot } from '../../utils/date.js'
import layout from '../policy/PolicyDetail.module.css'
import styles from './PostDetail.module.css'

// 게시글 상세 (GET /posts/{postId}). 시안이 없어 정책 상세와 같은 틀로 구성
// 내가 쓴 글(mine)이면 삭제, 아니면 신고. 숨김 글은 작성자에게만 보인다
export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { data: post, loading, error, reload, setData } = useApi(() => postApi.detail(postId), [postId])
  const [reportOpen, setReportOpen] = useState(false)

  if (!post) {
    return (
      <div className={layout.page}>
        <AsyncState loading={loading} error={error} onRetry={reload} />
        {error?.code === 'POST_NOT_FOUND' && (
          <p className={styles.back}>
            <Link to="/community">커뮤니티로 돌아가기</Link>
          </p>
        )}
      </div>
    )
  }

  // POST·DELETE /posts/{id}/likes
  const toggleLike = async () => {
    try {
      const res = post.liked ? await postApi.unlike(post.postId) : await postApi.like(post.postId)
      setData((p) => ({ ...p, liked: res.liked, likeCount: res.likeCount }))
    } catch (err) {
      window.alert(err.message)
    }
  }

  // DELETE /posts/{id} (소프트 삭제)
  const remove = async () => {
    if (!window.confirm('이 글을 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return
    try {
      await postApi.remove(post.postId)
      navigate('/community', { replace: true })
    } catch (err) {
      window.alert(err.message)
    }
  }

  const { policy, job } = post

  return (
    <div className={layout.page}>
      <nav aria-label="현재 위치" className={layout.breadcrumb}>
        <ol>
          <li><Link to="/">홈</Link></li>
          <li><Link to="/community">커뮤니티</Link></li>
          <li aria-current="page">{POST_TYPE[post.type]}</li>
        </ol>
      </nav>

      <header className={layout.head}>
        <div className={layout.titleRow}>
          <Tag>{POST_TYPE[post.type]}</Tag>
          <h1 className={layout.title}>{post.oneLiner}</h1>
        </div>
        <p className={layout.org}>
          익명 청년 · {authorStageLabel(post)} · {formatDot(post.createdAt)} 작성
        </p>
      </header>

      <Card className={styles.card}>
        {post.rating && <Stars value={post.rating} />}

        <dl className={styles.info}>
          {policy && (
            <div>
              <dt>정책·프로그램</dt>
              <dd><Link to={`/policies/${policy.policyId}`}>{policy.title}</Link></dd>
            </div>
          )}
          {job && (
            <div>
              <dt>채용공고</dt>
              <dd><Link to={`/jobs/${job.jobId}`}>{job.company} · {job.title}</Link></dd>
            </div>
          )}
          {post.jobCategory && (
            <div>
              <dt>직무</dt>
              <dd>{JOB_CATEGORY[post.jobCategory]}</dd>
            </div>
          )}
          <div>
            <dt>준비 기간</dt>
            <dd>{PREP_PERIOD[post.prepPeriod]}</dd>
          </div>
          {post.helpfulPoints.length > 0 && (
            <div>
              <dt>도움이 된 점</dt>
              <dd className={styles.tags}>
                {post.helpfulPoints.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {post.content && <p className={styles.content}>{post.content}</p>}

        {post.portfolioUrl && (
          <a href={post.portfolioUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            포트폴리오 보기 <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}

        <div className={styles.foot}>
          <button
            type="button"
            className={`${styles.like} ${post.liked ? styles.liked : ''}`}
            aria-pressed={post.liked}
            onClick={toggleLike}
          >
            <Heart size={16} aria-hidden="true" /> 도움돼요 {post.likeCount}
          </button>
          {post.mine ? (
            <Button variant="outline" onClick={remove}>삭제</Button>
          ) : (
            <Button variant="ghost" onClick={() => setReportOpen(true)}>신고</Button>
          )}
        </div>
      </Card>

      {reportOpen && (
        <ReportModal
          post={post}
          onClose={(reported) => {
            setReportOpen(false)
            // 신고 5건으로 숨겨졌으면 다시 불러올 때 POST_NOT_FOUND가 된다
            if (reported) reload()
          }}
        />
      )}
    </div>
  )
}
