import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { Chip, ChipGroup } from '../../components/Chip/Chip.jsx'
import { StarInput } from '../../components/Stars/Stars.jsx'
import { LIFE_STAGE, PREP_PERIOD } from '../../constants/enumLabels.js'
import { HELPFUL_POINTS, policies } from '../../mocks/data.js'
import { useAppState } from '../../context/AppState.jsx'
import { toIso, today } from '../../utils/date.js'
import styles from './ReviewWriteModal.module.css'

// 서버도 같은 검사를 한다(CONTACT_INFO_DETECTED). 화면에서는 먼저 알려 주기만 한다.
const CONTACT_PATTERN = /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4})|([\w.+-]+@[\w-]+\.[\w.]+)|(카톡|카카오톡|오픈채팅)\s*(아이디|id)?/i

export default function ReviewWriteModal({ onClose, onSubmit }) {
  const { profile, policyStatus } = useAppState()
  // 진행 중이거나 완료한 정책을 먼저 보여 준다
  const sorted = [...policies].sort(
    (a, b) => Number(policyStatus(a.policyId) === 'TO_CHECK') - Number(policyStatus(b.policyId) === 'TO_CHECK'),
  )
  const [form, setForm] = useState({
    policyId: sorted[0].policyId,
    rating: 5,
    title: '',
    prepPeriod: 'MONTH_1',
    helpfulPoints: [],
    content: '',
  })
  const [error, setError] = useState('')
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('한 줄 평을 입력해 주세요.')
    if (CONTACT_PATTERN.test(form.title) || CONTACT_PATTERN.test(form.content)) {
      return setError('연락처는 게시글에 쓸 수 없어요.')
    }
    // TODO(11주차): POST /posts
    onSubmit({
      ...form,
      type: 'PROGRAM_REVIEW',
      title: form.title.trim(),
      jobCategory: profile.jobCategories[0] ?? 'ETC',
      lifeStages: profile.lifeStages,
      authorStage: profile.lifeStages.map((s) => LIFE_STAGE[s]).join(' · '),
      createdAt: toIso(today()),
    })
  }

  return (
    <Modal open onClose={onClose} width={560} title="1분 후기 쓰기" description="나의 경험이 다음 청년의 준비에 도움이 돼요.">
      <form className={styles.form} onSubmit={submit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>연결할 정책·공고</span>
          <select
            className={styles.input}
            value={form.policyId}
            onChange={(e) => set('policyId', Number(e.target.value))}
          >
            {sorted.map((p) => (
              <option key={p.policyId} value={p.policyId}>{p.title}</option>
            ))}
          </select>
        </label>

        <div className={styles.field}>
          <span className={styles.label}>참여 경험은 어땠나요?</span>
          <StarInput value={form.rating} onChange={(v) => set('rating', v)} />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>한 줄 평</span>
          <input
            className={styles.input}
            maxLength={40}
            placeholder="실무 과제로 지원할 직무가 선명해졌어요"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>준비 기간</span>
          <div className={styles.chips}>
            {Object.entries(PREP_PERIOD).map(([key, label]) => (
              <Chip key={key} size="sm" selected={form.prepPeriod === key} onClick={() => set('prepPeriod', key)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            도움이 된 점 <small>복수 선택</small>
          </span>
          <ChipGroup
            size="sm"
            options={Object.fromEntries(HELPFUL_POINTS.map((p) => [p, p]))}
            values={form.helpfulPoints}
            onChange={(v) => set('helpfulPoints', v)}
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>
            자유 의견 <small>선택</small>
          </span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            maxLength={500}
            placeholder="준비하는 청년에게 전하고 싶은 팁을 남겨 주세요."
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
          />
        </label>

        <div className={styles.bottom}>
          <p className={error ? styles.error : styles.notice} role={error ? 'alert' : undefined}>
            <ShieldCheck size={14} aria-hidden="true" />
            {error || '실명·연락처는 쓰지 말아 주세요'}
          </p>
          <Button type="submit" size="lg" block>
            등록
          </Button>
        </div>
      </form>
    </Modal>
  )
}
