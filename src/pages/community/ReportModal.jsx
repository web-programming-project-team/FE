import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { postApi } from '../../api/index.js'
import { REPORT_REASON } from '../../constants/enumLabels.js'
import styles from './ReportModal.module.css'

// 시안에 없는 화면 — 카드의 "후기 신고하기"에서 사유를 고르는 모달 (POST /posts/{postId}/reports)
// onClose(true)면 신고가 접수된 것. 신고가 5건 쌓이면 서버가 바로 숨긴다(autoHidden)
export default function ReportModal({ post, onClose }) {
  const [reason, setReason] = useState(null)
  const [done, setDone] = useState(null) // null | 'received' | 'hidden'
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const res = await postApi.report(post.postId, { reason })
      setDone(res.autoHidden ? 'hidden' : 'received')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <Modal
        open
        onClose={() => onClose(true)}
        width={440}
        title="신고가 접수됐어요"
        description={
          done === 'hidden' ? '신고가 쌓여 이 글은 바로 숨겨졌어요. 운영자가 확인할게요.' : '운영자가 확인한 뒤 필요한 조치를 할게요.'
        }
        footer={<Button size="lg" block onClick={() => onClose(true)}>확인</Button>}
      />
    )
  }

  return (
    <Modal
      open
      onClose={() => onClose(false)}
      width={440}
      title="후기 신고하기"
      description={`"${post.oneLiner}"`}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={() => onClose(false)}>취소</Button>
          <Button size="lg" block disabled={!reason || submitting} onClick={submit}>
            신고하기
          </Button>
        </>
      }
    >
      <fieldset className={styles.reasons}>
        <legend className="sr-only">신고 사유</legend>
        {Object.entries(REPORT_REASON).map(([key, label]) => (
          <label key={key} className={styles.reason}>
            <input type="radio" name="reason" value={key} checked={reason === key} onChange={() => setReason(key)} />
            {label}
          </label>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </Modal>
  )
}
