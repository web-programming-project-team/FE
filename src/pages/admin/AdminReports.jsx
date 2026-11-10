import { useState } from 'react'
import Button from '../../components/Button/Button.jsx'
import { Chip } from '../../components/Chip/Chip.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { REPORT_REASON } from '../../constants/enumLabels.js'
import { adminApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { formatDot } from '../../utils/date.js'
import styles from './AdminPolicies.module.css'

const STATUS = { PENDING: '처리 대기', RESOLVED: '처리 완료' }
const PAGE_SIZE = 20

// 신고 관리: 게시글별로 묶은 신고 목록 (GET /admin/reports), 숨김·복구 (PATCH /admin/posts/{id}/visibility)
// 신고 5건이 쌓이면 서버가 자동으로 숨기고 목록 맨 위에 올린다. 처리하면 그 글의 신고는 '처리 완료'로 옮겨진다
export default function AdminReports() {
  const [status, setStatus] = useState('PENDING')
  const [page, setPage] = useState(0)

  const listQuery = useApi(() => adminApi.reports({ status, page, size: PAGE_SIZE }), [status, page])
  const data = listQuery.data
  const rows = data?.content ?? []

  const changeStatus = (key) => {
    setStatus(key)
    setPage(0)
  }

  const changeVisibility = async (row, hidden) => {
    let reason = null
    if (hidden) {
      reason = window.prompt(`'${row.oneLiner}'을 숨길까요? 숨김 사유를 적어 주세요.`, '신고 검토 결과 숨김')
      if (reason === null) return
    } else if (!window.confirm(`'${row.oneLiner}'을 다시 보이게 할까요?`)) {
      return
    }
    try {
      await adminApi.changePostVisibility(row.postId, { hidden, reason })
      listQuery.reload()
    } catch (err) {
      window.alert(err.message)
    }
  }

  const from = data && rows.length ? data.page * data.size + 1 : 0
  const to = data ? data.page * data.size + rows.length : 0

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>신고 관리</h1>
          <p className={styles.description}>신고된 후기를 검토하고 숨기거나 다시 보이게 하세요.</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {Object.entries(STATUS).map(([key, label]) => (
            <Chip key={key} size="md" selected={status === key} onClick={() => changeStatus(key)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles.meta}>
        <span>
          {STATUS[status]} <b>{data?.totalElements ?? 0}</b>건
        </span>
        <span>신고가 5건 쌓인 글은 자동으로 숨겨지고 맨 위에 보여요.</span>
      </div>

      <div className={styles.tableCard}>
        {!data ? (
          <AsyncState loading={listQuery.loading} error={listQuery.error} onRetry={listQuery.reload} />
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>게시글</th>
                  <th className={styles.center}>신고</th>
                  <th>사유</th>
                  <th>상태</th>
                  <th>최근 신고</th>
                  {status === 'PENDING' && <th className={styles.center}>관리</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.postId}>
                    <td className={styles.name}>{r.oneLiner}</td>
                    <td className={`${styles.center} ${styles.num}`}>{r.reportCount}</td>
                    <td>
                      {Object.entries(r.reasons)
                        .map(([reason, count]) => `${REPORT_REASON[reason]} ${count}`)
                        .join(' · ')}
                    </td>
                    <td>
                      <span className={`${styles.recruit} ${styles[r.autoHidden ? 'CLOSED' : 'OPEN']}`}>
                        {r.autoHidden ? '자동 숨김' : '공개 중'}
                      </span>
                    </td>
                    <td>{formatDot(r.lastReportedAt)}</td>
                    {status === 'PENDING' && (
                      <td className={styles.center}>
                        {/* 대기 중인 글은 자동 숨김이 아니면 공개 상태다 (숨김 글은 새로 신고할 수 없음) */}
                        {r.autoHidden ? (
                          <button type="button" className={styles.edit} onClick={() => changeVisibility(r, false)}>
                            복구
                          </button>
                        ) : (
                          <button type="button" className={styles.end} onClick={() => changeVisibility(r, true)}>
                            숨김
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={status === 'PENDING' ? 6 : 5} className={styles.emptyRow}>
                      {STATUS[status]}인 신고가 없어요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.pager}>
          <span>
            총 {data?.totalElements ?? 0}건 중 {from}–{to}건
          </span>
          <div className={styles.actions}>
            <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className={styles.page1} aria-current="page">{page + 1}</span>
            <Button variant="ghost" disabled={!data?.hasNext} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
