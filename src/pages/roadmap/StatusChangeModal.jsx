import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { ChipGroup } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, LIFE_STAGE } from '../../constants/enumLabels.js'
import { useAppState } from '../../context/AppState.jsx'
import styles from './StatusChangeModal.module.css'

export default function StatusChangeModal({ open, onClose }) {
  const { profile, updateProfile } = useAppState()
  const [lifeStages, setLifeStages] = useState(profile.lifeStages)
  const [interestFields, setInterestFields] = useState(profile.interestFields)

  const valid = lifeStages.length > 0 && interestFields.length > 0
  const focus = interestFields.map((f) => INTEREST_FIELD[f]).join('·')

  const onSubmit = () => {
    // TODO(9주차): PUT /users/me/status → 새 로드맵 생성, 기존 로드맵은 활동 기록으로 보관
    updateProfile({ lifeStages, interestFields })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="지금 상황이 바뀌었나요?"
      description="달라진 상황에 맞춰 다음 걸음을 준비해요."
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} className={styles.cancel}>
            취소
          </Button>
          <Button size="lg" block disabled={!valid} onClick={onSubmit}>
            새 로드맵 만들기
          </Button>
        </>
      }
    >
      <h3 className={styles.label}>현재 상황</h3>
      <ChipGroup options={LIFE_STAGE} values={lifeStages} onChange={setLifeStages} />

      <h3 className={styles.label}>
        관심분야 <span className={styles.hint}>여러 개 선택할 수 있어요</span>
      </h3>
      <ChipGroup options={INTEREST_FIELD} values={interestFields} onChange={setInterestFields} />

      {valid && (
        <p className={styles.notice}>
          기존 로드맵은 활동 기록으로 남고, {focus} 중심의 새 로드맵이 만들어져요.
        </p>
      )}
    </Modal>
  )
}
