import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import Card from '../../components/Card/Card.jsx'
import DdayTag from '../../components/DdayTag/DdayTag.jsx'
import { Chip, Tag } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, PROGRESS_STATUS, RECRUIT_STATUS } from '../../constants/enumLabels.js'
import { policies } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { formatRange } from '../../utils/date.js'
import styles from './Policies.module.css'

// 지원정보 목록 (GET /policies). 기본은 접수 중·접수 예정, 마감 가까운 순.
export default function Policies() {
  const { policyStatus } = useAppState()
  const [params, setParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const field = params.get('field')

  const query = keyword.trim()
  const list = policies
    .filter((p) => p.recruitStatus === 'OPEN' || p.recruitStatus === 'UPCOMING')
    .filter((p) => !field || p.field === field)
    .filter((p) => !query || p.title.includes(query) || p.agency.includes(query))
    .sort((a, b) => a.applyEndDate.localeCompare(b.applyEndDate))

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>지원정보</h1>
      <p className={styles.description}>시흥 청년이 신청할 수 있는 정책과 프로그램을 모았어요.</p>

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
        <p className={styles.count}>{list.length}개</p>
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
                    <span className={styles.progress}>{PROGRESS_STATUS[policyStatus(p.policyId)]}</span>
                    <Tag>{RECRUIT_STATUS[p.recruitStatus]}</Tag>
                    <DdayTag date={p.applyEndDate} />
                    <ChevronRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
