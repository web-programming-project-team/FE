import { useEffect, useState } from 'react'
import { CircleAlert, Plus, Search, TriangleAlert } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import { Chip } from '../../components/Chip/Chip.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import PolicyFormModal from './PolicyFormModal.jsx'
import { RECRUIT_STATUS } from '../../constants/enumLabels.js'
import { adminApi, policyApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { daysUntil, formatDot } from '../../utils/date.js'
import styles from './AdminPolicies.module.css'

const STALE_DAYS = 30
const daysSinceCheck = (p) => -daysUntil(p.lastVerifiedAt)

// 필터 → GET /admin/policies 쿼리
const FILTERS = {
  ALL: { label: '전체', params: {} },
  UPCOMING: { label: '접수 예정', params: { recruitStatus: 'UPCOMING' } },
  OPEN: { label: '접수 중', params: { recruitStatus: 'OPEN' } },
  CLOSED: { label: '마감', params: { recruitStatus: 'CLOSED' } },
  ENDED: { label: '종료', params: { recruitStatus: 'ENDED' } },
  STALE: { label: '확인 필요', params: { stale: true } },
}

const SOURCE = { ADMIN: '직접 등록', ONTONG: '온통청년' }

export default function AdminPolicies() {
  const [filter, setFilter] = useState('ALL')
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | 정책 상세

  useEffect(() => {
    const t = setTimeout(() => setQuery(keyword.trim()), 300)
    return () => clearTimeout(t)
  }, [keyword])

  const listQuery = useApi(
    () => adminApi.policies({ ...FILTERS[filter].params, keyword: query || undefined, size: 50 }),
    [filter, query],
  )
  // 상단 경고의 '확인 필요' 건수
  const staleQuery = useApi(() => adminApi.policies({ stale: true, size: 1 }), [])
  const rows = listQuery.data?.content ?? []
  const staleCount = staleQuery.data?.totalElements ?? 0

  const refresh = () => {
    listQuery.reload()
    staleQuery.reload()
  }

  const run = async (action) => {
    try {
      await action()
      refresh()
    } catch (err) {
      window.alert(err.data?.errors?.[0]?.reason ?? err.message)
    }
  }

  // PATCH /admin/policies/{id}/end
  const endPolicy = (p) => {
    const reason = window.prompt(`'${p.title}'을 종료할까요? 종료 사유를 적어 주세요.`, '사업 종료')
    if (reason === null) return
    run(() => adminApi.endPolicy(p.policyId, reason))
  }

  // PATCH /admin/policies/{id}/verify
  const verifyPolicy = (p) => run(() => adminApi.verifyPolicy(p.policyId))

  // 수정 폼은 상세 정보(지원대상·내용·URL 등)가 필요해서 GET /policies/{id}로 채운다
  const openEdit = async (p) => {
    try {
      setEditing(await policyApi.detail(p.policyId))
    } catch (err) {
      window.alert(err.message)
    }
  }

  // POST /admin/policies, PUT /admin/policies/{id}
  const savePolicy = async (form) => {
    const body = {
      title: form.title,
      field: form.field,
      agency: form.agency,
      target: form.target,
      content: form.content,
      applyStartDate: form.applyStartDate || null,
      applyEndDate: form.applyEndDate || null,
      contact: form.contact || null,
      sourceUrl: form.sourceUrl,
      applyUrl: form.applyUrl || null,
    }
    try {
      if (form.policyId) await adminApi.updatePolicy(form.policyId, body)
      else await adminApi.createPolicy(body)
      setEditing(null)
      refresh()
    } catch (err) {
      window.alert(err.data?.errors?.[0]?.reason ?? err.message)
    }
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
          <input type="search" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="정책명·운영기관 검색" />
        </label>
      </div>

      <div className={styles.meta}>
        <span>
          {FILTERS[filter].label} <b>{listQuery.data?.totalElements ?? 0}</b>건
        </span>
        <span>출처는 정책 정보의 수집 경로입니다.</span>
      </div>

      <div className={styles.tableCard}>
        {!listQuery.data ? (
          <AsyncState loading={listQuery.loading} error={listQuery.error} onRetry={listQuery.reload} />
        ) : (
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
                    <td>{p.applyEndDate ? formatDot(p.applyEndDate) : '상시'}</td>
                    <td>
                      {formatDot(p.lastVerifiedAt)}
                      {p.stale && (
                        <div className={styles.stale}>
                          <span className={styles.staleBadge}>
                            <TriangleAlert size={12} aria-hidden="true" /> 확인 필요
                          </span>
                          <span>{daysSinceCheck(p)}일 경과 · 정보 최신성</span>
                          <button type="button" className={styles.edit} onClick={() => verifyPolicy(p)}>
                            확인 완료
                          </button>
                        </div>
                      )}
                    </td>
                    <td className={`${styles.num} ${styles.count}`}>{p.roadmapItemCount}명</td>
                    <td className={styles.center}>
                      <div className={styles.actions}>
                        <button type="button" className={styles.edit} onClick={() => openEdit(p)}>
                          수정
                        </button>
                        <span aria-hidden="true">/</span>
                        <button
                          type="button"
                          className={styles.end}
                          disabled={p.recruitStatus === 'ENDED'}
                          onClick={() => endPolicy(p)}
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
        )}
        <div className={styles.pager}>
          <span>
            총 {listQuery.data?.totalElements ?? 0}건 중 {rows.length ? 1 : 0}–{rows.length}건
          </span>
          <span className={styles.page1} aria-current="page">1</span>
        </div>
      </div>

      <div className={styles.notes}>
        <p>
          <strong>정보 최신성 안내</strong> &lsquo;확인 필요&rsquo;는 마지막 정보 확인 후 {STALE_DAYS}일 경과를 뜻하며,
          사용자 로드맵의 진행상태와는 별개입니다. 모집상태는 접수기간으로 서버가 계산해요.
        </p>
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
