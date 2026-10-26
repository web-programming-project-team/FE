import { useEffect, useState } from 'react'
import client from '../api/client.js'

// 임시 페이지: 프록시·CORS 연결 확인 후 삭제
export default function HealthCheck() {
  const [result, setResult] = useState('확인 중...')

  useEffect(() => {
    client
      .get('/health')
      .then((data) => setResult(`${data.status} (${data.time})`))
      .catch((e) => setResult(`실패: ${e.code} ${e.message}`))
  }, [])

  return (
    <section>
      <h1>백엔드 연결 확인</h1>
      <p data-testid="health-status">{result}</p>
    </section>
  )
}
