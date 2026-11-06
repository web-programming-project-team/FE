import Card from '../../components/Card/Card.jsx'
import { Chip } from '../../components/Chip/Chip.jsx'
import { EDUCATION, EMPLOYMENT_TYPE, JOB_CATEGORY, REGION } from '../../constants/enumLabels.js'
import styles from './JobFilter.module.css'

// 맞춤 채용 조건 (Figma "필터"). 고른 값은 프로필의 채용 조건으로 저장된다 (PATCH /users/me/job-preference)
// 지역·직무·고용형태는 여러 개, 학력은 하나. 경력은 잡아바 신입 가능 공고만 수집하므로 '신입' 고정
export default function JobFilter({ regions, jobCategories, education, employmentTypes = [], onChange }) {
  const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const groups = [
    {
      legend: '희망 지역',
      options: REGION,
      selected: (v) => regions.includes(v),
      pick: (v) => onChange({ regions: toggle(regions, v) }),
    },
    {
      legend: '희망 직무',
      options: JOB_CATEGORY,
      selected: (v) => jobCategories.includes(v),
      pick: (v) => onChange({ jobCategories: toggle(jobCategories, v) }),
    },
    {
      legend: '학력',
      hint: '하나만 골라요. 대졸은 졸업 예정 포함',
      options: EDUCATION,
      selected: (v) => education === v,
      pick: (v) => v !== education && onChange({ education: v }),
    },
    {
      legend: '고용형태',
      options: EMPLOYMENT_TYPE,
      selected: (v) => employmentTypes.includes(v),
      pick: (v) => onChange({ employmentTypes: toggle(employmentTypes, v) }),
    },
  ]

  return (
    <Card className={styles.panel}>
      <h2 className={styles.title}>원하는 조건을 선택해 주세요</h2>
      <div className={styles.groups}>
        {groups.map((g) => (
          <fieldset key={g.legend} className={styles.group}>
            <legend>
              {g.legend}
              {g.hint && <span className={styles.hint}>{g.hint}</span>}
            </legend>
            <div className={styles.chips}>
              {Object.entries(g.options).map(([value, label]) => (
                <Chip key={value} size="sm" showCheck={false} selected={g.selected(value)} onClick={() => g.pick(value)}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <p className={styles.fixed}>경력은 신입 가능 공고(신입 · 신입/경력 · 경력무관)만 보여드려요.</p>
    </Card>
  )
}
