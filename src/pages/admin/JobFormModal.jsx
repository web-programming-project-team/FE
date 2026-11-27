import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { EDUCATION, EMPLOYMENT_TYPE, JOB_CATEGORY, REGION } from '../../constants/enumLabels.js'
import styles from './PolicyFormModal.module.css'

const EMPTY = {
  company: '',
  title: '',
  region: 'SIHEUNG',
  address: '',
  education: 'ANY',
  employmentType: 'FULL_TIME',
  jobCategory: 'OFFICE',
  salary: '',
  deadline: '',
  originalUrl: '',
}

const options = (labels) =>
  Object.entries(labels).map(([k, v]) => (
    <option key={k} value={k}>{v}</option>
  ))

// 시안에 없는 화면 — "공고 등록" / "수정"에서 여는 입력 폼 (POST·PUT /admin/jobs, 본문 전체)
export default function JobFormModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    const filled = { ...EMPTY }
    for (const key of Object.keys(EMPTY)) if (job?.[key] != null) filled[key] = job[key]
    return { ...filled, jobId: job?.jobId }
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={640}
      title={job ? '채용공고 수정' : '채용공고 등록'}
      description="잡아바에 없는 지역 공고나 시연용 공고를 직접 등록해요. 저장하면 맞춤 채용 목록에 수집 공고와 똑같이 나오고, 도움 되는 지원이 자동으로 연결돼요."
    >
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          <span>회사명</span>
          <input className={styles.input} value={form.company} onChange={set('company')} maxLength={100} required />
        </label>
        <label className={styles.field}>
          <span>직무</span>
          <select className={styles.input} value={form.jobCategory} onChange={set('jobCategory')}>
            {options(JOB_CATEGORY)}
          </select>
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>공고 제목</span>
          <input className={styles.input} value={form.title} onChange={set('title')} maxLength={200} required />
        </label>
        <label className={styles.field}>
          <span>지역</span>
          <select className={styles.input} value={form.region} onChange={set('region')}>
            {options(REGION)}
          </select>
        </label>
        <label className={styles.field}>
          <span>근무지</span>
          <input className={styles.input} value={form.address} onChange={set('address')} maxLength={200} />
          <small>예: 경기 시흥시 정왕동</small>
        </label>
        <label className={styles.field}>
          <span>최소 학력</span>
          <select className={styles.input} value={form.education} onChange={set('education')}>
            {options(EDUCATION)}
          </select>
        </label>
        <label className={styles.field}>
          <span>고용형태</span>
          <select className={styles.input} value={form.employmentType} onChange={set('employmentType')}>
            {options(EMPLOYMENT_TYPE)}
          </select>
        </label>
        <label className={styles.field}>
          <span>마감일</span>
          <input className={styles.input} type="date" value={form.deadline} onChange={set('deadline')} required />
        </label>
        <label className={styles.field}>
          <span>급여</span>
          <input className={styles.input} value={form.salary} onChange={set('salary')} maxLength={100} />
          <small>예: 회사 내규</small>
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>공고 원문 URL</span>
          <input
            className={styles.input}
            type="url"
            placeholder="https://"
            value={form.originalUrl}
            onChange={set('originalUrl')}
            maxLength={500}
            required
          />
          <small>사용자가 &lsquo;공식 사이트에서 지원&rsquo;을 누르면 이 주소로 이동해요</small>
        </label>

        <div className={`${styles.wide} ${styles.actions}`}>
          <Button variant="outline" size="lg" onClick={onClose}>취소</Button>
          <Button type="submit" size="lg" block>저장</Button>
        </div>
      </form>
    </Modal>
  )
}
