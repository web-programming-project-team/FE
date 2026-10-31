import { useMemo, useState } from 'react'
import { CircleAlert, Plus, Search, TriangleAlert } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import { Chip } from '../../components/Chip/Chip.jsx'
import PolicyFormModal from './PolicyFormModal.jsx'
import { RECRUIT_STATUS } from '../../constants/enumLabels.js'
import { BASE_DATE, policies as initialPolicies } from '../../mocks/data.js'
import { daysUntil, formatDot, today, toIso } from '../../utils/date.js'
import styles from './AdminPolicies.module.css'

const STALE_DAYS = 30
const daysSinceCheck = (p) => -daysUntil(p.lastVerifiedAt)
const isStale = (p) => p.recruitStatus !== 'ENDED' && daysSinceCheck(p) > STALE_DAYS

const FILTERS = {
  ALL: { label: '전체', test: () => true },
  OPEN: { label: '접수 중', test: (p) => p.recruitStatus === 'OPEN' },
  CLOSED: { label: '마감', test: (p) => p.recruitStatus === 'CLOSED' },
  ENDED: { label: '종료', test: (p) => p.recruitStatus === 'ENDED' },
  STALE: { label: '확인 필요', test: isStale },
}

const SOURCE = { ADMIN: '직접 등록', ONTONG: '온통청년' }

export default function AdminPolicies() {
  const [list, setList] = useState(initialPolicies)
  const [filter, setFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | policy

  const rows = useMemo(
    () =>
      list
        .filter(FILTERS[filter].test)
        .filter((p) => !query || `${p.title} ${p.agency}`.includes(query.trim())),
    [list, filter, query],
  )
  const staleCount = list.filter(isStale).length

  // TODO(7주차): PATCH /admin/policies/{id}/end
  const endPolicy = (policyId) =>
    setList((prev) => prev.map((p) => (p.policyId === policyId ? { ...p, recruitStatus: 'ENDED' } : p)))

  // TODO(7주차): POST /admin/policies, PUT /admin/policies/{id}
  const savePolicy = (data) => {
    const checked = { ...data, lastVerifiedAt: toIso(today()) }
    setList((prev) =>
      data.policyId
        ? prev.map((p) => (p.policyId === data.policyId ? { ...p, ...checked } : p))
        : [...prev, { ...checked, policyId: Date.now(), source: 'ADMIN', roadmapItemCount: 0 }],
    )
    setEditing(null)
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>정책·프로그램 관리</h1>
          <p className={styles.description}>모집 상태와 정보 최신성을 확인하고 정책 정보를 관리하세요.</p>
        </div>
        <Button size="lg" onClick={() => setEditing('new')}>
          <Plus size={18} aria-hidden="true" /> 정책 등록
        </Button>
      </header>

      {staleCount > 0 && (
        <div className={styles.alert} role="status">
          <CircleAlert size={18} className={styles.alertIcon} aria-hidden="true" />
          <p>
            <strong>정보 확인이 필요한 정책이 {staleCount}건 있어요</strong>
            마지막 확인 후 {STALE_DAYS}일이 지난 정보를 점검해 주세요.
          </p>
          <span className={styles.base}>기준일 {formatDot(BASE_DATE)}</span>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {Object.entries(FILTERS).map(([key, f]) => (
            <Chip key={key} size="md" selected={filter === key} onClick={() => setFilter(key)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">정책명·운영기관 검색</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="정책명·운영기관 검색" />
        </label>
      </div>

      <div className={styles.meta}>
        <span>
          {FILTERS[filter].label} <b>{rows.length}</b>건
        </span>
        <span>출처는 정책 정보의 수집 경로입니다.</span>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>정책명</th>
                <th>운영기관</th>
                <th>출처</th>
                <th>모집상태</th>
                <th>마감일</th>
                <th>마지막 확인일</th>
                <th className={styles.num}>담은 사용자 수</th>
                <th className={styles.center}>관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.policyId}>
                  <td className={styles.name}>{p.title}</td>
                  <td className={styles.org}>{p.agency}</td>
                  <td>{SOURCE[p.source]}</td>
                  <td>
                    <span className={`${styles.recruit} ${styles[p.recruitStatus]}`}>
                      {RECRUIT_STATUS[p.recruitStatus]}
                    </span>
                  </td>
                  <td>{formatDot(p.applyEndDate)}</td>
                  <td>
                    {formatDot(p.lastVerifiedAt)}
                    {isStale(p) && (
                      <div className={styles.stale}>
                        <span className={styles.staleBadge}>
                          <TriangleAlert size={12} aria-hidden="true" /> 확인 필요
                        </span>
                        <span>{daysSinceCheck(p)}일 경과 · 정보 최신성</span>
                      </div>
                    )}
                  </td>
                  <td className={`${styles.num} ${styles.count}`}>{p.roadmapItemCount}명</td>
                  <td className={styles.center}>
                    <div className={styles.actions}>
                      <button type="button" className={styles.edit} onClick={() => setEditing(p)}>
                        수정
                      </button>
                      <span aria-hidden="true">/</span>
                      <button
                        type="button"
                        className={styles.end}
                        disabled={p.recruitStatus === 'ENDED'}
                        onClick={() => endPolicy(p.policyId)}
                      >
                        종료
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>조건에 맞는 정책이 없어요.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.pager}>
          <span>
            총 {rows.length}건 중 {rows.length ? 1 : 0}–{rows.length}건
          </span>
          <span className={styles.page1} aria-current="page">1</span>
        </div>
      </div>

      <div className={styles.notes}>
        <p>
          <strong>정보 최신성 안내</strong> &lsquo;확인 필요&rsquo;는 마지막 정보 확인 후 {STALE_DAYS}일 경과를 뜻하며,
          사용자 로드맵의 진행상태와는 별개입니다.
        </p>
        <p>정책·기관 정보와 사용자 수는 서비스 설명을 위한 예시 데이터입니다.</p>
      </div>

      {editing && (
        <PolicyFormModal
          policy={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={savePolicy}
        />
      )}
    </div>
  )
}
