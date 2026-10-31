import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { INTEREST_FIELD, RECRUIT_STATUS } from '../../constants/enumLabels.js'
import styles from './PolicyFormModal.module.css'

const EMPTY = {
  title: '',
  agency: '',
  field: 'EMPLOYMENT',
  target: '',
  content: '',
  contact: '',
  applyStartDate: '',
  applyEndDate: '',
  recruitStatus: 'UPCOMING',
  sourceUrl: '',
  applyUrl: '',
}

// 시안에 없는 화면 — "정책 등록" / "수정"에서 여는 입력 폼
export default function PolicyFormModal({ policy, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...policy }))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const rangeInvalid = form.applyStartDate && form.applyEndDate && form.applyStartDate > form.applyEndDate

  const submit = (e) => {
    e.preventDefault()
    if (rangeInvalid) return
    onSave(form)
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={640}
      title={policy ? '정책 수정' : '정책 등록'}
      description="모든 정책에는 공식 출처 URL을 남겨요. 저장하면 마지막 확인일이 오늘로 바뀌어요."
    >
      <form className={styles.form} onSubmit={submit}>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>정책명</span>
          <input className={styles.input} value={form.title} onChange={set('title')} required />
        </label>
        <label className={styles.field}>
          <span>운영기관</span>
          <input className={styles.input} value={form.agency} onChange={set('agency')} required />
        </label>
        <label className={styles.field}>
          <span>분야</span>
          <select className={styles.input} value={form.field} onChange={set('field')}>
            {Object.entries(INTEREST_FIELD).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>접수 시작</span>
          <input className={styles.input} type="date" value={form.applyStartDate} onChange={set('applyStartDate')} required />
        </label>
        <label className={styles.field}>
          <span>접수 마감</span>
          <input
            className={styles.input}
            type="date"
            value={form.applyEndDate}
            onChange={set('applyEndDate')}
            aria-invalid={Boolean(rangeInvalid)}
            required
          />
          {rangeInvalid && <small className={styles.error}>마감일이 시작일보다 빨라요</small>}
        </label>
        <label className={styles.field}>
          <span>모집상태</span>
          <select className={styles.input} value={form.recruitStatus} onChange={set('recruitStatus')}>
            {Object.entries(RECRUIT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>문의처</span>
          <input className={styles.input} value={form.contact} onChange={set('contact')} />
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>지원대상</span>
          <input className={styles.input} value={form.target} onChange={set('target')} required />
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>지원내용</span>
          <input className={styles.input} value={form.content} onChange={set('content')} required />
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>공식 출처 URL</span>
          <input
            className={styles.input}
            type="url"
            placeholder="https://"
            value={form.sourceUrl}
            onChange={set('sourceUrl')}
            required
          />
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>신청 URL</span>
          <input
            className={styles.input}
            type="url"
            placeholder="https://"
            value={form.applyUrl}
            onChange={set('applyUrl')}
            required
          />
        </label>

        <div className={`${styles.wide} ${styles.actions}`}>
          <Button variant="outline" size="lg" onClick={onClose}>취소</Button>
          <Button type="submit" size="lg" block>저장</Button>
        </div>
      </form>
    </Modal>
  )
}
