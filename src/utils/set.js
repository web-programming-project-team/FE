// Set에서 id를 넣거나 빼서 새 Set을 돌려준다 (상태 갱신용)
export function toggled(set, id) {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}
