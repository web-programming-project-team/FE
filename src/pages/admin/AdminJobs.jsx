import { useEffect, useState } from 'react'
import { ExternalLink, Plus, Search } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import { Chip } from '../../components/Chip/Chip.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import JobFormModal from './JobFormModal.jsx'
import { JOB_CATEGORY, REGION } from '../../constants/enumLabels.js'
import { adminApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { ddayLabel, formatDot } from '../../utils/date.js'
import styles from './AdminPolicies.module.css'

// 필터 → GET /admin/jobs 쿼리
const FILTERS = {
  ADMIN: { label: '직접 등록', params: { source: 'ADMIN' } },
  ADMIN_OPEN: { label: '접수 중', params: { source: 'ADMIN', closed: false } },
  ADMIN_CLOSED: { label: '마감', params: { source: 'ADMIN', closed: true } },
  JOBABA: { label: '잡아바 수집', params: { source: 'JOBABA' } },
}
const SOURCE = { ADMIN: '직접 등록', JOBABA: '잡아바' }
const PAGE_SIZE = 20

// 채용공고 관리: 목록(GET /admin/jobs) · 등록 · 수정(직접 등록 공고만) · 마감
export default function AdminJobs() {
  const [filter, setFilter] = useState('ADMIN')
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState(null) // null | 'new' | 공고 행

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(keyword.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [keyword])

  const listQuery = useApi(
    () => adminApi.jobs({ ...FILTERS[filter].params, keyword: query || undefined, page, size: PAGE_SIZE }),
    [filter, query, page],
  )
  const data = listQuery.data
  const rows = data?.content ?? []

  const changeFilter = (key) => {
    setFilter(key)
    setPage(0)
  }

  // PATCH /admin/jobs/{id}/close
  const closeJob = async (job) => {
    if (!window.confirm(`'${job.company} · ${job.title}'을 마감할까요? 맞춤 채용 목록에서 빠져요.`)) return
    try {
      await adminApi.closeJob(job.jobId)
      listQuery.reload()
    } catch (err) {
      window.alert(err.message)
    }
  }

  // POST /admin/jobs, PUT /admin/jobs/{id}
  const saveJob = async (form) => {
    const body = {
      company: form.company,
      title: form.title,
      region: form.region,
      address: form.address || null,
      education: form.education,
      careerLevel: 'NEW',
      employmentType: form.employmentType,
      jobCategory: form.jobCategory,
      salary: form.salary || null,
      deadline: form.deadline,
      originalUrl: form.originalUrl,
    }
    try {
      if (form.jobId) await adminApi.updateJob(form.jobId, body)
      else await adminApi.createJob(body)
      setEditing(null)
      listQuery.reload()
    } catch (err) {
      window.alert(err.data?.errors?.[0]?.reason ?? err.message)
    }
  }

  const from = data && rows.length ? data.page * data.size + 1 : 0
  const to = data ? data.page * data.size + rows.length : 0

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>채용공고 관리</h1>
          <p className={styles.description}>잡아바에 없는 공고를 직접 등록하고, 마감된 공고를 정리하세요.</p>
        </div>
        <Button size="lg" onClick={() => setEditing('new')}>
          <Plus size={18} aria-hidden="true" /> 공고 등록
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {Object.entries(FILTERS).map(([key, f]) => (
            <Chip key={key} size="md" selected={filter === key} onClick={() => changeFilter(key)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">회사명·공고 제목 검색</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="회사명·공고 제목 검색"
          />
        </label>
      </div>

      <div className={styles.meta}>
        <span>
          {FILTERS[filter].label} <b>{data?.totalElements ?? 0}</b>건
        </span>
        <span>잡아바 공고는 매일 수집 때 덮어써져서 수정할 수 없고, 마감만 할 수 있어요.</span>
      </div>

      <div className={styles.tableCard}>
        {!data ? (
          <AsyncState loading={listQuery.loading} error={listQuery.error} onRetry={listQuery.reload} />
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>공고</th>
                  <th>회사</th>
                  <th>지역 · 직무</th>
                  <th>출처</th>
                  <th>상태</th>
                  <th>마감일</th>
                  <th>등록일</th>
                  <th className={styles.center}>관리</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => (
                  <tr key={j.jobId}>
                    <td className={styles.name}>
                      <a href={j.originalUrl} target="_blank" rel="noopener noreferrer">
                        {j.title} <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    </td>
                    <td className={styles.org}>{j.company}</td>
                    <td>
                      {REGION[j.region]} · {JOB_CATEGORY[j.jobCategory]}
                    </td>
                    <td>{SOURCE[j.source]}</td>
                    <td>
                      <span className={`${styles.recruit} ${styles[j.closed ? 'CLOSED' : 'OPEN']}`}>
                        {j.closed ? '마감' : '접수 중'}
                      </span>
                    </td>
                    <td>{j.deadline ? `${formatDot(j.deadline)} (${ddayLabel(j.dDay)})` : '상시'}</td>
                    <td>{formatDot(j.collectedAt)}</td>
                    <td className={styles.center}>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.edit}
                          disabled={j.source !== 'ADMIN'}
                          onClick={() => setEditing(j)}
                        >
                          수정
                        </button>
                        <span aria-hidden="true">/</span>
                        <button type="button" className={styles.end} disabled={j.closed} onClick={() => closeJob(j)}>
                          마감
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>조건에 맞는 공고가 없어요.</td>
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

      {editing && (
        <JobFormModal job={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={saveJob} />
      )}
    </div>
  )
}
