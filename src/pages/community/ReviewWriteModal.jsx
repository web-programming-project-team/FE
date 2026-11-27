import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import Select from '../../components/Select/Select.jsx'
import { Chip, ChipGroup } from '../../components/Chip/Chip.jsx'
import { StarInput } from '../../components/Stars/Stars.jsx'
import { HELPFUL_POINTS, JOB_CATEGORY, POST_TYPE, PREP_PERIOD } from '../../constants/enumLabels.js'
import { postApi } from '../../api/index.js'
import { useAppState } from '../../context/AppState.jsx'
import styles from './ReviewWriteModal.module.css'

// 서버도 같은 검사를 한다(CONTACT_INFO_DETECTED). 화면에서는 먼저 알려 주기만 한다.
const CONTACT_PATTERN = /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4})|([\w.+-]+@[\w-]+\.[\w.]+)|(카톡|카카오톡|오픈채팅)\s*(아이디|id)?/i
const URL_PATTERN = /^https?:\/\/\S+$/i
// 합격 후기·포트폴리오에서 정책을 연결하지 않을 때의 선택지 값
const NO_POLICY = 0

// 종류마다 다른 입력 (명세: PROGRAM_REVIEW는 policyId, PASS_REVIEW는 jobCategory, PORTFOLIO는 portfolioUrl 필수)
const GUIDE = {
  PROGRAM_REVIEW: { policyLabel: '참여한 정책', placeholder: '실무 과제로 지원할 직무가 선명해졌어요' },
  PASS_REVIEW: { policyLabel: '도움이 된 정책', placeholder: '컴활 1급과 모의면접이 도움이 됐어요' },
  PORTFOLIO: { policyLabel: '관련 정책', placeholder: '아카데미에서 만든 웹 프로젝트예요' },
}

// 1분 후기 작성 (POST /posts). 작성자 상황(authorStage)은 서버가 로그인 회원의 상황으로 채운다
// policies: 커뮤니티 화면이 불러온 정책 목록, initialPolicyId: 정책 필터로 보고 있던 정책
// initialType: 보고 있던 탭. onSubmit(type)으로 쓴 글의 종류를 알려 준다
export default function ReviewWriteModal({ policies, initialPolicyId, initialType = 'PROGRAM_REVIEW', onClose, onSubmit }) {
  const { profile } = useAppState()
  const [form, setForm] = useState({
    type: initialType,
    policyId: initialPolicyId ?? policies[0]?.policyId ?? null,
    jobCategory: profile.jobPreference.jobCategories[0] ?? 'OFFICE',
    rating: 5,
    oneLiner: '',
    prepPeriod: 'MONTH_1',
    helpfulPoints: [],
    content: '',
    portfolioUrl: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const isProgram = form.type === 'PROGRAM_REVIEW'
  const isPortfolio = form.type === 'PORTFOLIO'
  const guide = GUIDE[form.type]
  // 참여 후기는 정책이 꼭 있어야 하고, 나머지는 '연결 안 함'을 고를 수 있다
  const policyOptions = [
    ...(isProgram ? [] : [[NO_POLICY, '연결 안 함']]),
    ...policies.map((p) => [p.policyId, p.title]),
  ]
  const policyValue = !isProgram && !form.policyId ? NO_POLICY : form.policyId

  const submit = async (e) => {
    e.preventDefault()
    const policyId = form.policyId || null
    const portfolioUrl = form.portfolioUrl.trim()
    if (isProgram && !policyId) return setError('참여한 정책을 골라 주세요.')
    if (isPortfolio && !URL_PATTERN.test(portfolioUrl)) return setError('포트폴리오 링크를 http:// 또는 https://로 입력해 주세요.')
    if (!form.oneLiner.trim()) return setError('한 줄 평을 입력해 주세요.')
    if (CONTACT_PATTERN.test(form.oneLiner) || CONTACT_PATTERN.test(form.content)) {
      return setError('연락처는 게시글에 쓸 수 없어요.')
    }
    setError('')
    setSubmitting(true)
    try {
      await postApi.create({
        type: form.type,
        policyId,
        // 참여 후기의 직무 태그는 맞춤 채용 조건의 첫 직무 (없으면 비움)
        jobCategory: isProgram ? (profile.jobPreference.jobCategories[0] ?? null) : form.jobCategory,
        rating: isPortfolio ? null : form.rating,
        oneLiner: form.oneLiner.trim(),
        prepPeriod: form.prepPeriod,
        helpfulPoints: form.helpfulPoints,
        content: form.content,
        portfolioUrl: isPortfolio ? portfolioUrl : null,
      })
      onSubmit(form.type)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} width={560} title="1분 후기 쓰기" description="나의 경험이 다음 청년의 준비에 도움이 돼요.">
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.field}>
          <span className={styles.label}>어떤 이야기인가요?</span>
          <div className={styles.chips}>
            {Object.entries(POST_TYPE).map(([key, label]) => (
              <Chip key={key} size="sm" selected={form.type === key} onClick={() => set('type', key)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            {guide.policyLabel} {!isProgram && <small>선택</small>}
          </span>
          <Select
            label={guide.policyLabel}
            className={styles.input}
            value={policyValue}
            onChange={(v) => set('policyId', v === NO_POLICY ? null : v)}
            options={policyOptions}
          />
        </div>

        {!isProgram && (
          <div className={styles.field}>
            <span className={styles.label}>직무</span>
            <div className={styles.chips}>
              {Object.entries(JOB_CATEGORY).map(([key, label]) => (
                <Chip key={key} size="sm" selected={form.jobCategory === key} onClick={() => set('jobCategory', key)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {isPortfolio ? (
          <label className={styles.field}>
            <span className={styles.label}>포트폴리오 링크</span>
            <input
              className={styles.input}
              type="url"
              maxLength={500}
              placeholder="https://github.com/..."
              value={form.portfolioUrl}
              onChange={(e) => set('portfolioUrl', e.target.value)}
            />
          </label>
        ) : (
          <div className={styles.field}>
            <span className={styles.label}>{isProgram ? '참여 경험은 어땠나요?' : '준비 과정은 어땠나요?'}</span>
            <StarInput value={form.rating} onChange={(v) => set('rating', v)} />
          </div>
        )}

        <label className={styles.field}>
          <span className={styles.label}>한 줄 평</span>
          <input
            className={styles.input}
            maxLength={60}
            placeholder={guide.placeholder}
            value={form.oneLiner}
            onChange={(e) => set('oneLiner', e.target.value)}
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
          <Button type="submit" size="lg" block disabled={submitting}>
            등록
          </Button>
        </div>
      </form>
    </Modal>
  )
}
