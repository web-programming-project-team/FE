import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import { ChipGroup } from '../../components/Chip/Chip.jsx'
import { INTEREST_FIELD, LIFE_STAGE } from '../../constants/enumLabels.js'
import { profileApi } from '../../api/index.js'
import { useAppState } from '../../context/AppState.jsx'
import { sameValues } from '../../utils/set.js'
import styles from './StatusChangeModal.module.css'

export default function StatusChangeModal({ open, onClose, onRenewed }) {
  const { profile, reloadUser } = useAppState()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lifeStages, setLifeStages] = useState(profile.lifeStages)
  const [interests, setInterests] = useState(profile.interests)

  const changed =
    !sameValues(lifeStages, profile.lifeStages) || !sameValues(interests, profile.interests)
  const valid = lifeStages.length > 0 && interests.length > 0 && changed
  const focus = interests.map((f) => INTEREST_FIELD[f]).join('·')

  // POST /users/me/life-stage-change: 기존 로드맵은 서버가 활동 기록으로 보관하고 새 로드맵을 만든다
  const onSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await profileApi.changeLifeStage({ lifeStages, interests })
      await reloadUser()
      onRenewed(res)
      onClose()
      if (res.suggestReview) window.alert('첫 취업을 축하해요! 커뮤니티에 합격 후기를 남겨 보세요.')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
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
          <Button size="lg" block disabled={!valid || submitting} onClick={onSubmit}>
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
      <ChipGroup options={INTEREST_FIELD} values={interests} onChange={setInterests} />

      {error && (
        <p className={styles.notice} role="alert">
          {error}
        </p>
      )}
      {valid && (
        <p className={styles.notice}>
          기존 로드맵은 활동 기록으로 남고, {focus} 중심의 새 로드맵이 만들어져요.
        </p>
      )}
    </Modal>
  )
}
