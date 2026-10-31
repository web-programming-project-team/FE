import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { REPORT_REASON } from '../../constants/enumLabels.js'
import styles from './ReportModal.module.css'

// 시안에 없는 화면 — 카드의 "후기 신고하기"에서 사유를 고르는 모달
export default function ReportModal({ post, onClose }) {
  const [reason, setReason] = useState(null)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <Modal
        open
        onClose={onClose}
        width={440}
        title="신고가 접수됐어요"
        description="운영자가 확인한 뒤 필요한 조치를 할게요."
        footer={<Button size="lg" block onClick={onClose}>확인</Button>}
      />
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={440}
      title="후기 신고하기"
      description={`"${post.oneLiner}"`}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose}>취소</Button>
          {/* TODO(11주차): POST /posts/{postId}/reports */}
          <Button size="lg" block disabled={!reason} onClick={() => setDone(true)}>
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
    </Modal>
  )
}
