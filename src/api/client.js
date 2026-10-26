import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 명세의 { success, code, message, data } 껍데기를 벗겨 data만 돌려준다
client.interceptors.response.use(
  (res) => res.data?.data ?? null,
  (error) => {
    const body = error.response?.data
    // TOKEN_EXPIRED면 6주차에 /auth/refresh 재시도 로직 추가
    return Promise.reject({
      status: error.response?.status,
      code: body?.code ?? 'NETWORK_ERROR',
      message: body?.message ?? '서버에 연결할 수 없어요.',
      data: body?.data,
    })
  },
)

export default client
