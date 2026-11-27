import { policyApi, roadmapApi } from '../../api/index.js'

// '이 공고에 도움 되는 지원'의 진행상태 변경. 맞춤 채용 목록과 채용 상세가 같이 쓴다
// - 로드맵에 없으면(myStatus null) POST /roadmaps/me/items로 담는다
// - 이미 있으면 항목 ID가 응답에 없으므로 정책 상세의 myItem으로 찾아 PATCH /roadmap-items/{itemId}/status
// 바뀐 상태를 돌려준다
export async function changeHelpfulStatus(policy, status) {
  if (!policy.myStatus) {
    const res = await roadmapApi.addItem(policy.policyId, status)
    return res.status
  }
  const detail = await policyApi.detail(policy.policyId)
  if (!detail.myItem) {
    const res = await roadmapApi.addItem(policy.policyId, status)
    return res.status
  }
  const res = await roadmapApi.changeStatus(detail.myItem.itemId, status)
  if (res.suggestReview) window.alert('완료했어요! 커뮤니티에 1분 후기를 남겨 보세요.')
  return res.status
}

// 같은 정책이 여러 공고에 붙어 있으므로 목록 전체에서 그 정책의 상태를 바꾼다
export const withPolicyStatus = (jobs, policyId, status) =>
  jobs.map((j) => ({
    ...j,
    helpfulPolicies: j.helpfulPolicies.map((p) => (p.policyId === policyId ? { ...p, myStatus: status } : p)),
  }))
