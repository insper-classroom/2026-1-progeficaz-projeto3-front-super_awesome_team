import { useMemo } from 'react'
import { getMockMetas } from '../services/mockData'
// import api from '../services/api'  // descomentar quando o backend estiver pronto

export function useMetas(grupoId) {
  const data = useMemo(() => {
    if (!grupoId) return null
    return getMockMetas(grupoId)
  }, [grupoId])

  const loading = false
  const error = null

  return { data, loading, error }
}
