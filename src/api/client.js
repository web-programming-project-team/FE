import axios from 'axios'

const ACCESS = 'accessToken'
const REFRESH = 'refreshToken'

export const tokens = {
  access: () => localStorage.getItem(ACCESS),
  refresh: () => localStorage.getItem(REFRESH),
  save: ({ accessToken, refreshToken }) => {
    localStorage.setItem(ACCESS, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
  },
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = tokens.access()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 동시에 여러 요청이 만료돼도 재발급은 한 번만 한다
let refreshing = null
async function refreshTokens() {
  const refreshToken = tokens.refresh()
  if (!refreshToken) throw new Error('no refresh token')
  const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken })
  tokens.save(res.data.data)
}

function toError(error) {
  const body = error.response?.data
  return {
    status: error.response?.status,
    code: body?.code ?? 'NETWORK_ERROR',
    message: body?.message ?? '서버에 연결할 수 없어요.',
    data: body?.data,
  }
}

function goLogin() {
  tokens.clear()
  if (window.location.pathname !== '/login') window.location.assign('/login')
}

// 명세의 { success, code, message, data } 껍데기를 벗겨 data만 돌려준다
client.interceptors.response.use(
  (res) => res.data?.data ?? null,
  async (error) => {
    const err = toError(error)
    const original = error.config
    // Access 토큰 만료: Refresh 토큰으로 재발급하고 원래 요청을 한 번 다시 보낸다
    if (err.code === 'TOKEN_EXPIRED' && original && !original._retried) {
      original._retried = true
      try {
        refreshing ??= refreshTokens().finally(() => (refreshing = null))
        await refreshing
        return client(original)
      } catch {
        goLogin()
        return Promise.reject(err)
      }
    }
    // 토큰이 있는데 401이면(탈퇴·잘못된 토큰) 로그인 화면으로
    if (err.status === 401 && tokens.access() && original?.url !== '/auth/login') goLogin()
    return Promise.reject(err)
  },
)

export default client
