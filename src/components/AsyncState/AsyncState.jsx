import Button from '../Button/Button.jsx'
import styles from './AsyncState.module.css'

// 불러오는 중 · 실패 안내. error가 있으면 다시 시도 버튼을 보여준다
export default function AsyncState({ loading, error, onRetry }) {
  if (loading) {
    return (
      <p className={styles.box} role="status">
        불러오는 중이에요…
      </p>
    )
  }
  if (error) {
    return (
      <div className={styles.box} role="alert">
        <p>{error.message ?? '불러오지 못했어요.'}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    )
  }
  return null
}
