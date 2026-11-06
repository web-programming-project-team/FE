import Card from '../../components/Card/Card.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { adminApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { formatDot } from '../../utils/date.js'
import styles from './AdminPolicies.module.css'

// 시안이 없는 관리자 메뉴 — 정책 관리 표와 같은 형태로 구성
// 운영 지표(GET /admin/stats, 최근 7일)와 자동 수집 기록(GET /admin/sync/logs)
const STATUS = { RUNNING: '진행 중', SUCCESS: '성공', FAILED: '실패' }
const time = (dt) => (dt ? `${formatDot(dt)} ${dt.slice(11, 16)}` : '-')

export default function AdminCollect() {
  const stats = useApi(() => adminApi.stats(), [])
  const logs = useApi(() => adminApi.syncLogs({ size: 20 }), [])
  const s = stats.data

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>데이터 수집·운영 지표</h1>
          <p className={styles.description}>개인 식별 정보 없이 집계한 운영 지표와 외부 데이터 자동 수집 결과예요.</p>
        </div>
      </header>

      {!s ? (
        <AsyncState loading={stats.loading} error={stats.error} onRetry={stats.reload} />
      ) : (
        <>
          <div className={styles.meta}>
            <span>
              기간 <b>{formatDot(s.period.from)}–{formatDot(s.period.to)}</b>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
            <Metric label="7일 재방문율" value={`${Math.round(s.revisitRate7d * 100)}%`} />
            <Metric label="관심 공고 저장" value={`${s.bookmarkedJobCount}건`} />
            <Metric label="후기 작성" value={`${s.reviewCount}건`} />
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>관심 많은 프로그램</th>
                    <th className={styles.num}>관심 등록 사용자</th>
                    <th className={styles.num}>후기</th>
                  </tr>
                </thead>
                <tbody>
                  {s.topPrograms.map((p) => (
                    <tr key={p.policyId}>
                      <td className={styles.name}>{p.title}</td>
                      <td className={`${styles.num} ${styles.count}`}>{p.roadmapItemCount}명</td>
                      <td className={styles.num}>{p.reviewCount}건</td>
                    </tr>
                  ))}
                  {s.topPrograms.length === 0 && (
                    <tr>
                      <td colSpan={3} className={styles.emptyRow}>아직 진행상태를 고른 사용자가 없어요.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className={styles.tableCard}>
        {!logs.data ? (
          <AsyncState loading={logs.loading} error={logs.error} onRetry={logs.reload} />
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>출처</th>
                  <th>결과</th>
                  <th className={styles.num}>가져옴</th>
                  <th className={styles.num}>추가</th>
                  <th className={styles.num}>갱신</th>
                  <th className={styles.num}>실패</th>
                  <th>시작</th>
                  <th>끝</th>
                </tr>
              </thead>
              <tbody>
                {logs.data.content.map((l) => (
                  <tr key={l.syncLogId}>
                    <td>{l.source === 'JOBABA' ? '잡아바 채용' : '온통청년 정책'}</td>
                    <td title={l.errorMessage ?? undefined}>{STATUS[l.status] ?? l.status}</td>
                    <td className={styles.num}>{l.fetched}</td>
                    <td className={styles.num}>{l.inserted}</td>
                    <td className={styles.num}>{l.updated}</td>
                    <td className={styles.num}>{l.failed}</td>
                    <td>{time(l.startedAt)}</td>
                    <td>{time(l.finishedAt)}</td>
                  </tr>
                ))}
                {logs.data.content.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>아직 수집 기록이 없어요.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <Card>
      <p className={styles.description}>{label}</p>
      <strong style={{ fontSize: 'var(--fs-3xl)' }}>{value}</strong>
    </Card>
  )
}
