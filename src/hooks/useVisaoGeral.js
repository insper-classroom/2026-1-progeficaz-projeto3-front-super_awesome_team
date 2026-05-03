import { useMemo } from 'react'
import { getMockVisaoGeral } from '../services/mockData'
// import api from '../services/api'  // descomentar quando o backend estiver pronto

export function useVisaoGeral(grupoId, periodo = '30d') {
  const data = useMemo(() => {
    if (!grupoId) return null
    return getMockVisaoGeral(grupoId, periodo)
  }, [grupoId, periodo])

  const loading = false
  const error = null

  return { data, loading, error }
}
