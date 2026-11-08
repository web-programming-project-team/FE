import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, ScrollText, Search } from 'lucide-react'
import PageHead from '../../components/PageHead/PageHead.jsx'
import Card from '../../components/Card/Card.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import AsyncState from '../../components/AsyncState/AsyncState.jsx'
import { Chip, Tag } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, PROGRESS_STATUS, RECRUIT_STATUS } from '../../constants/enumLabels.js'
import { policyApi } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'
import { formatRange } from '../../utils/date.js'
import styles from './Policies.module.css'

// 지원정보 목록 (GET /policies). 기본은 접수 중·접수 예정, 마감 가까운 순. 로그인하면 내 진행상태가 함께 온다
export default function Policies() {
  const [params, setParams] = useSearchParams()
  const urlKeyword = params.get('keyword') ?? ''
  const [keyword, setKeyword] = useState(urlKeyword)
  const [query, setQuery] = useState(urlKeyword)
  const field = params.get('field')

  // 헤더 검색창에서 새 검색어가 넘어오면 반영. 분야 칩이 URL을 바꿔도 입력한 검색어는 유지
  const [lastUrlKeyword, setLastUrlKeyword] = useState(urlKeyword)
  if (urlKeyword && urlKeyword !== lastUrlKeyword) {
    setLastUrlKeyword(urlKeyword)
    setKeyword(urlKeyword)
  }

  // 입력이 멈추고 0.3초 뒤에 검색
  useEffect(() => {
    const t = setTimeout(() => setQuery(keyword.trim()), 300)
    return () => clearTimeout(t)
  }, [keyword])

  const { data, loading, error, reload } = useApi(
    () => policyApi.list({ field: field ?? undefined, keyword: query || undefined, size: 50 }),
    [field, query],
  )
  const list = data?.content ?? []

  return (
    <div className={styles.page}>
      <PageHead decor="policies" icon={ScrollText} title="지원정보" description="시흥 청년이 신청할 수 있는 정책과 프로그램을 모았어요." />

      <div className={styles.toolbar}>
        <div className={styles.chips} role="group" aria-label="분야">
          <Chip size="sm" showCheck={false} selected={!field} onClick={() => setParams({})}>전체</Chip>
          {Object.entries(INTEREST_FIELD).map(([value, label]) => (
            <Chip key={value} size="sm" showCheck={false} selected={field === value} onClick={() => setParams({ field: value })}>
              {label}
            </Chip>
          ))}
        </div>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">정책명·기관명 검색</span>
          <input
            type="search"
            placeholder="정책명·기관명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
      </div>

      <Card padding="none" className={styles.card}>
        {!data ? (
          <AsyncState loading={loading} error={error} onRetry={reload} />
        ) : (
          <>
            <p className={styles.count}>{data.totalElements}개</p>
            {list.length === 0 ? (
              <p className={styles.empty}>조건에 맞는 지원정보가 없어요. 분야나 검색어를 바꿔 보세요.</p>
            ) : (
              <ul>
                {list.map((p) => (
                  <li key={p.policyId}>
                    <Link to={`/policies/${p.policyId}`} className={styles.row}>
                      <span className={styles.main}>
                        <strong>{p.title}</strong>
                        <span>{p.agency} · 접수 {formatRange(p.applyStartDate, p.applyEndDate)}</span>
                      </span>
                      <span className={styles.meta}>
                        {p.myStatus && <span className={styles.progress}>{PROGRESS_STATUS[p.myStatus]}</span>}
                        <Tag>{RECRUIT_STATUS[p.recruitStatus]}</Tag>
                        <DdayTag dDay={p.dDay} />
                        <ChevronRight size={16} aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
