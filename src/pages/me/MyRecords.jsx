import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Card from '../../components/Card/Card.jsx'
import Collapse from '../../components/Collapse/Collapse.jsx'
import StatusSelect from '../../components/StatusSelect/StatusSelect.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Tag } from '../../components/Chip/Chip.jsx'
import { postApi, roadmapApi } from '../../api/index.js'
import { POST_TYPE } from '../../constants/enumLabels.js'
import { useApi } from '../../hooks/useApi.js'
import { formatDot } from '../../utils/date.js'
import styles from '../policy/Policies.module.css'

// 내 기록: 상황 변경으로 보관된 지난 로드맵 (GET /roadmaps/me/history, 상세는 GET /roadmaps/{roadmapId})
// 와 내가 쓴 후기 (GET /users/me/posts). 시안이 없어 지원정보 목록과 같은 형태로 구성
export default function MyRecords() {
  const { data, loading, error, reload } = useApi(() => roadmapApi.history(), [])
  const [openId, setOpenId] = useState(null)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>내 기록</h1>
      <p className={styles.description}>상황이 바뀌기 전에 걸어온 로드맵과 내가 쓴 후기를 다시 볼 수 있어요.</p>

      <Card padding="none" className={styles.card}>
        {!data ? (
          <AsyncState loading={loading} error={error} onRetry={reload} />
        ) : (
          <>
            <p className={styles.count}>지난 로드맵 {data.length}개</p>
            {data.length === 0 ? (
              <p className={styles.empty}>아직 보관된 로드맵이 없어요. 상황을 바꾸면 이전 로드맵이 여기에 남아요.</p>
            ) : (
              <ul>
                {data.map((r) => (
                  <li key={r.roadmapId}>
                    <button
                      type="button"
                      className={styles.row}
                      style={{ width: '100%', textAlign: 'left' }}
                      aria-expanded={openId === r.roadmapId}
                      onClick={() => setOpenId(openId === r.roadmapId ? null : r.roadmapId)}
                    >
                      <span className={styles.main}>
                        <strong>{r.templateName}</strong>
                        <span>{formatDot(r.archivedAt)} 보관 · 완료 {r.completedCount}개</span>
                      </span>
                      <span className={styles.meta}>
                        <Tag>진행률 {r.progressRate}%</Tag>
                        {openId === r.roadmapId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>
                    <Collapse open={openId === r.roadmapId}>
                      <PastRoadmap roadmapId={r.roadmapId} />
                    </Collapse>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>

      <MyPosts />
    </div>
  )
}

// 내가 쓴 후기·포트폴리오. 숨김 처리된 글도 본인에게는 '숨김'으로 보여준다
function MyPosts() {
  const { data, loading, error, reload } = useApi(() => postApi.mine({ size: 50 }), [])

  return (
    <Card padding="none" className={styles.card}>
      {!data ? (
        <AsyncState loading={loading} error={error} onRetry={reload} />
      ) : (
        <>
          <p className={styles.count}>내가 쓴 후기 {data.totalElements}개</p>
          {data.content.length === 0 ? (
            <p className={styles.empty}>
              아직 쓴 후기가 없어요. <Link to="/community">커뮤니티</Link>에서 1분 후기를 남겨 보세요.
            </p>
          ) : (
            <ul>
              {data.content.map((p) => (
                <li key={p.postId}>
                  <Link to={`/community/${p.postId}`} className={styles.row}>
                    <span className={styles.main}>
                      <strong>{p.oneLiner}</strong>
                      <span>
                        {p.policy ? `${p.policy.title} · ` : ''}
                        {formatDot(p.createdAt)} 작성
                      </span>
                    </span>
                    <span className={styles.meta}>
                      {p.hidden && <Tag>숨김</Tag>}
                      <Tag>{POST_TYPE[p.type]}</Tag>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  )
}

// 보관된 로드맵은 읽기 전용이라 진행상태 배지만 보여준다
function PastRoadmap({ roadmapId }) {
  const { data, loading, error, reload } = useApi(() => roadmapApi.detail(roadmapId), [roadmapId])
  if (!data) return <AsyncState loading={loading} error={error} onRetry={reload} />
  return (
    <ol style={{ padding: 'var(--space-4) var(--space-6)', display: 'grid', gap: 'var(--space-4)' }}>
      {data.steps.map((s) => (
        <li key={s.stepOrder}>
          <strong>
            {s.stepOrder}. {s.title}
          </strong>
          <ul style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {s.items.map((i) => (
              <li key={i.itemId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span>{i.title}</span>
                <StatusSelect value={i.status} />
              </li>
            ))}
            {s.items.length === 0 && <li className={styles.empty}>담긴 지원이 없었어요.</li>}
          </ul>
        </li>
      ))}
    </ol>
  )
}
