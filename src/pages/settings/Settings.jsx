import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import Card from '../../components/Card/Card.jsx'
import { ChipGroup } from '../../components/Chip/Chip.jsx'
import { EDUCATION, EMPLOYMENT_TYPE, INTEREST_FIELD, JOB_CATEGORY, LIFE_STAGE, REGION } from '../../constants/enumLabels.js'
import { profileApi } from '../../api/index.js'
import { useAppState } from '../../context/AppState.jsx'
import { sameValues } from '../../utils/set.js'
import styles from './Settings.module.css'

const labels = (values, map) => (values.length ? values.map((v) => map[v]).join(' · ') : '-')

export default function Settings() {
  const navigate = useNavigate()
  const { profile, reloadUser } = useAppState()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lifeStages, setLifeStages] = useState(profile.lifeStages)
  const [interests, setInterests] = useState(profile.interests)
  const pref = profile.jobPreference
  const [regions, setRegions] = useState(pref.regions)
  const [jobCategories, setJobCategories] = useState(pref.jobCategories)
  // 학력은 하나만. 온보딩에서 묻지 않아 비어 있을 수 있다
  const [education, setEducation] = useState(pref.education ? [pref.education] : [])
  const [employmentTypes, setEmploymentTypes] = useState(pref.employmentTypes)

  const valid = lifeStages.length > 0 && interests.length > 0 && regions.length > 0 && jobCategories.length > 0
  // 상황·관심분야가 바뀌면 새 로드맵을 만든다 (POST /users/me/life-stage-change)
  const needsNewRoadmap =
    !sameValues(lifeStages, profile.lifeStages) || !sameValues(interests, profile.interests)

  // 채용 조건은 바뀐 필드만 보낸다 (PATCH /users/me/job-preference)
  const preferencePatch = {
    ...(!sameValues(regions, pref.regions) && { regions }),
    ...(!sameValues(jobCategories, pref.jobCategories) && { jobCategories }),
    ...(education[0] && education[0] !== pref.education && { education: education[0] }),
    ...(!sameValues(employmentTypes, pref.employmentTypes) && { employmentTypes }),
  }
  const preferenceChanged = Object.keys(preferencePatch).length > 0

  // 상황·관심분야가 바뀌면 POST /users/me/life-stage-change(새 로드맵), 채용 조건만 바뀌면 PATCH /users/me/job-preference
  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (needsNewRoadmap) await profileApi.changeLifeStage({ lifeStages, interests })
      if (preferenceChanged) await profileApi.updateJobPreference(preferencePatch)
      await reloadUser()
      navigate('/')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
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

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>희망 직무</h2>
            <p className={styles.sectionHint}>여러 개 고를 수 있어요.</p>
            <ChipGroup options={JOB_CATEGORY} values={jobCategories} onChange={setJobCategories} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>학력</h2>
            <p className={styles.sectionHint}>하나만 골라 주세요. 대졸은 졸업 예정을 포함해요.</p>
            <ChipGroup options={EDUCATION} values={education} onChange={setEducation} multiple={false} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>고용형태</h2>
            <p className={styles.sectionHint}>원하는 고용형태를 모두 골라 주세요. 고르지 않으면 모두 보여드려요.</p>
            <ChipGroup options={EMPLOYMENT_TYPE} values={employmentTypes} onChange={setEmploymentTypes} />
          </section>

          <div className={styles.foot}>
            <p className={styles.hint}>
              {needsNewRoadmap
                ? '저장하면 기존 로드맵은 활동 기록으로 남고 새 로드맵이 만들어져요.'
                : '저장하면 맞춤 설정에 반영돼요.'}
            </p>
            {error && (
              <p className={styles.hint} role="alert">
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <Button variant="outline" to="/">취소</Button>
              <Button type="submit" disabled={!valid || submitting || (!needsNewRoadmap && !preferenceChanged)}>
                변경사항 저장
              </Button>
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
              <div><dt>희망 지역</dt><dd>{labels(pref.regions, REGION)}</dd></div>
              <div><dt>희망 직무</dt><dd>{labels(pref.jobCategories, JOB_CATEGORY)}</dd></div>
              <div><dt>학력</dt><dd>{pref.education ? EDUCATION[pref.education] : '-'}</dd></div>
              <div><dt>고용형태</dt><dd>{labels(pref.employmentTypes, EMPLOYMENT_TYPE)}</dd></div>
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
