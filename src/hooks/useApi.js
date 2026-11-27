import { useCallback, useEffect, useRef, useState } from 'react'

// API 한 개를 불러와 { data, loading, error, reload, setData }로 돌려준다
// deps가 바뀌면 다시 부른다. 늦게 온 이전 응답은 버린다
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const seq = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps)

  const reload = useCallback(() => {
    const id = ++seq.current
    setState((s) => ({ ...s, loading: true, error: null }))
    return load()
      .then((data) => {
        if (id === seq.current) setState({ data, loading: false, error: null })
        return data
      })
      .catch((error) => {
        if (id === seq.current) setState((s) => ({ ...s, loading: false, error }))
      })
  }, [load])

  useEffect(() => {
    reload()
  }, [reload])

  const setData = useCallback((update) => {
    setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update }))
  }, [])

  return { ...state, reload, setData }
}
