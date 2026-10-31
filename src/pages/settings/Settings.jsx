import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import { ChipGroup } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, LIFE_STAGE, REGION } from '../../constants/enumLabels.js'
import { useAppState } from '../../context/AppState.jsx'
import { sameValues } from '../../utils/set.js'
import styles from './Settings.module.css'

const labels = (values, map) => values.map((v) => map[v]).join(' · ')

export default function Settings() {
  const navigate = useNavigate()
  const { profile, updateProfile, updateJobPreference, resetRoadmap } = useAppState()
  const [lifeStages, setLifeStages] = useState(profile.lifeStages)
  const [interests, setInterests] = useState(profile.interests)
  const [regions, setRegions] = useState(profile.jobPreference.regions)

  const valid = lifeStages.length > 0 && interests.length > 0 && regions.length > 0
  // 상황·관심분야가 바뀌면 새 로드맵을 만든다 (POST /users/me/life-stage-change)
  const needsNewRoadmap =
    !sameValues(lifeStages, profile.lifeStages) || !sameValues(interests, profile.interests)

  const onSubmit = (e) => {
    e.preventDefault()
    // TODO(9주차): POST /users/me/life-stage-change, PATCH /users/me/job-preference 연결
    updateProfile({ lifeStages, interests })
    updateJobPreference({ regions })
    if (needsNewRoadmap) resetRoadmap()
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <nav className={styles.crumb} aria-label="현재 위치">
        <Link to="/">홈</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">맞춤 설정 변경</span>
      </nav>
      <h1 className={styles.title}>맞춤 설정 변경</h1>
      <p className={styles.description}>
        지금의 상황과 관심분야를 알려주세요. 나에게 필요한 지원을 찾는 기준이 돼요.
      </p>

      <div className={styles.columns}>
        <Card as="form" padding="none" onSubmit={onSubmit}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>
            <label className={styles.field}>
              <span className={styles.label}>닉네임</span>
              <input className={styles.input} value={profile.nickname} readOnly aria-describedby="nickname-hint" />
              <span id="nickname-hint" className={styles.hint}>가입할 때 정한 이름이에요. 홈에서 이 이름으로 불러드려요.</span>
            </label>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>현재 상황</h2>
            <p className={styles.sectionHint}>지금 나에게 해당하는 상황을 모두 선택해 주세요.</p>
            <CheckGrid name="현재 상황" options={LIFE_STAGE} values={lifeStages} onChange={setLifeStages} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>관심분야</h2>
            <p className={styles.sectionHint}>지원받고 싶은 분야를 모두 선택해 주세요.</p>
            <CheckGrid name="관심분야" options={INTEREST_FIELD} values={interests} onChange={setInterests} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>희망 지역</h2>
            <p className={styles.sectionHint}>맞춤 채용공고를 고를 때 써요.</p>
            <ChipGroup options={REGION} values={regions} onChange={setRegions} />
          </section>

          <div className={styles.foot}>
            <p className={styles.hint}>
              {needsNewRoadmap
                ? '저장하면 기존 로드맵은 활동 기록으로 남고 새 로드맵이 만들어져요.'
                : '저장하면 맞춤 설정에 반영돼요.'}
            </p>
            <div className={styles.actions}>
              <Button variant="outline" to="/">취소</Button>
              <Button type="submit" disabled={!valid}>변경사항 저장</Button>
            </div>
          </div>
        </Card>

        <aside className={styles.side}>
          <Card>
            <h2 className={styles.sectionTitle}>현재 저장된 설정</h2>
            <p className={styles.sectionHint}>변경사항을 저장하기 전의 정보예요.</p>
            <dl className={styles.saved}>
              <div><dt>닉네임</dt><dd>{profile.nickname}</dd></div>
              <div><dt>현재 상황</dt><dd>{labels(profile.lifeStages, LIFE_STAGE)}</dd></div>
              <div><dt>관심분야</dt><dd>{labels(profile.interests, INTEREST_FIELD)}</dd></div>
              <div><dt>희망 지역</dt><dd>{labels(profile.jobPreference.regions, REGION)}</dd></div>
            </dl>
          </Card>
          <div className={styles.guide}>
            <h2 className={styles.guideTitle}>내 상황에 맞게 바꿔보세요</h2>
            <p>설정한 상황과 관심분야는 내 로드맵과 관심분야 지원정보를 준비하는 데 사용해요.</p>
            <p>새로운 지원이 필요해지면 언제든 다시 수정할 수 있어요.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CheckGrid({ name, options, values, onChange }) {
  const toggle = (value) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])

  return (
    <div className={styles.checks} role="group" aria-label={name}>
      {Object.entries(options).map(([value, label]) => {
        const checked = values.includes(value)
        return (
          <label key={value} className={`${styles.check} ${checked ? styles.checked : ''}`}>
            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(value)} />
            <span className={styles.box} aria-hidden="true">
              {checked && <Check size={14} strokeWidth={3} />}
            </span>
            {label}
          </label>
        )
      })}
    </div>
  )
}
