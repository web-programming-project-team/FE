import client, { tokens } from './client.js'

// 화면에서 쓰는 API 모음 (API 명세 v1.5). 응답은 data만 온다

export const authApi = {
  signup: (body) => client.post('/auth/signup', body),
  login: async (body) => {
    const data = await client.post('/auth/login', body)
    tokens.save(data)
    return data
  },
  logout: async () => {
    try {
      await client.post('/auth/logout')
    } finally {
      tokens.clear()
    }
  },
  me: () => client.get('/users/me'),
}

export const profileApi = {
  get: () => client.get('/users/me/profile'),
  save: (body) => client.put('/users/me/profile', body),
  updateJobPreference: (patch) => client.patch('/users/me/job-preference', patch),
  changeLifeStage: (body) => client.post('/users/me/life-stage-change', body),
}

export const roadmapApi = {
  summary: () => client.get('/home/summary'),
  mine: () => client.get('/roadmaps/me'),
  detail: (roadmapId) => client.get(`/roadmaps/${roadmapId}`),
  history: () => client.get('/roadmaps/me/history'),
  changeStatus: (itemId, status) => client.patch(`/roadmap-items/${itemId}/status`, { status }),
  addItem: (policyId, status) => client.post('/roadmaps/me/items', { policyId, status }),
  removeItem: (itemId) => client.delete(`/roadmap-items/${itemId}`),
}

export const policyApi = {
  list: (params) => client.get('/policies', { params }),
  detail: (policyId) => client.get(`/policies/${policyId}`),
}

export const calendarApi = {
  monthly: (year, month) => client.get('/calendar/events', { params: { year, month } }),
  upcoming: (days = 7) => client.get('/calendar/events/upcoming', { params: { days } }),
  create: (body) => client.post('/calendar/events', body),
  remove: (eventId) => client.delete(`/calendar/events/${eventId}`),
}

export const jobApi = {
  // sort: deadline(기본) · latest
  recommended: (params) => client.get('/jobs/recommended', { params }),
  detail: (jobId) => client.get(`/jobs/${jobId}`),
  bookmark: (jobId) => client.post(`/jobs/${jobId}/bookmark`),
  unbookmark: (jobId) => client.delete(`/jobs/${jobId}/bookmark`),
  bookmarks: (params) => client.get('/jobs/bookmarks', { params }),
}

// 커뮤니티: 후기·포트폴리오, 좋아요, 신고
export const postApi = {
  list: (params) => client.get('/posts', { params }),
  detail: (postId) => client.get(`/posts/${postId}`),
  create: (body) => client.post('/posts', body),
  update: (postId, patch) => client.patch(`/posts/${postId}`, patch),
  remove: (postId) => client.delete(`/posts/${postId}`),
  mine: (params) => client.get('/users/me/posts', { params }),
  like: (postId) => client.post(`/posts/${postId}/likes`),
  unlike: (postId) => client.delete(`/posts/${postId}/likes`),
  report: (postId, body) => client.post(`/posts/${postId}/reports`, body),
}

export const notificationApi = {
  list: (params) => client.get('/notifications', { params }),
  unreadCount: () => client.get('/notifications/unread-count'),
  read: (notificationId) => client.patch(`/notifications/${notificationId}/read`),
  readAll: () => client.patch('/notifications/read-all'),
}

export const adminApi = {
  policies: (params) => client.get('/admin/policies', { params }),
  createPolicy: (body) => client.post('/admin/policies', body),
  updatePolicy: (policyId, body) => client.put(`/admin/policies/${policyId}`, body),
  endPolicy: (policyId, reason) => client.patch(`/admin/policies/${policyId}/end`, { reason }),
  verifyPolicy: (policyId) => client.patch(`/admin/policies/${policyId}/verify`),
  stats: (params) => client.get('/admin/stats', { params }),
  syncLogs: (params) => client.get('/admin/sync/logs', { params }),
  jobs: (params) => client.get('/admin/jobs', { params }),
  createJob: (body) => client.post('/admin/jobs', body),
  updateJob: (jobId, body) => client.put(`/admin/jobs/${jobId}`, body),
  closeJob: (jobId) => client.patch(`/admin/jobs/${jobId}/close`),
  reports: (params) => client.get('/admin/reports', { params }),
  changePostVisibility: (postId, body) => client.patch(`/admin/posts/${postId}/visibility`, body),
}
