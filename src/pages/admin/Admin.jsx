import Card from '../../components/Card/Card.jsx'

// 시안이 아직 없는 관리자 메뉴 (로드맵 템플릿, 신고 관리, 데이터 수집)
export default function Admin({ title }) {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700 }}>{title}</h1>
      <Card style={{ marginTop: 'var(--space-6)', color: 'var(--color-text-3)' }}>
        화면 시안이 나오면 구현할 예정이에요.
      </Card>
    </div>
  )
}
