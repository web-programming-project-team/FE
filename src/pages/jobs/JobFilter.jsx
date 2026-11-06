import Card from '../../components/Card/Card.jsx'
import { Chip } from '../../components/Chip/Chip.jsx'
import { EDUCATION, EMPLOYMENT_TYPE, JOB_CATEGORY, REGION } from '../../constants/enumLabels.js'
import styles from './JobFilter.module.css'

// 맞춤 채용 조건 (Figma "필터"). 고른 값은 프로필의 채용 조건으로 저장된다.
export default function JobFilter({ regions, jobCategories, education, employmentTypes = [], onChange }) {
  // 학력·고용형태는 이 패널에서 고르지 않는다. 저장된 값이 없으면 '무관'
  const educationLabel = education ? `${EDUCATION[education]}${education === 'UNIVERSITY' ? '(졸업 예정 포함)' : ''}` : '무관'
  const employmentLabel = employmentTypes.length ? employmentTypes.map((t) => EMPLOYMENT_TYPE[t]).join('·') : '무관'
  const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  return (
    <Card className={styles.panel}>
      <h2 className={styles.title}>원하는 조건을 선택해 주세요</h2>
      <div className={styles.groups}>
        <fieldset className={styles.group}>
          <legend>희망 지역</legend>
          <div className={styles.chips}>
            {Object.entries(REGION).map(([value, label]) => (
              <Chip
                key={value}
                size="sm"
                showCheck={false}
                selected={regions.includes(value)}
                onClick={() => onChange({ regions: toggle(regions, value) })}
              >
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>희망 직무</legend>
          <div className={styles.chips}>
            {Object.entries(JOB_CATEGORY).map(([value, label]) => (
              <Chip
                key={value}
                size="sm"
                showCheck={false}
                selected={jobCategories.includes(value)}
                onClick={() => onChange({ jobCategories: toggle(jobCategories, value) })}
              >
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
      <p className={styles.fixed}>
        학력 {educationLabel} · 경력 신입 · 고용형태 {employmentLabel}
      </p>
    </Card>
  )
}
