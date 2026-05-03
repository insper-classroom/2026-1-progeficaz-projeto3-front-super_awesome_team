import { useState, useEffect } from 'react'
import { getMockMetas } from '../services/mockData'
// import api from '../services/api'  // descomentar quando o backend estiver pronto

export function useMetas(grupoId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!grupoId) return
    setLoading(true)
    setError(null)

    // --- mock (remover quando o backend estiver pronto) ---
    const resultado = getMockMetas(grupoId)
    setData(resultado)
    setLoading(false)

    // --- (descomentar quando o backend estiver pronto) ---
    // api.get(`/grupos/${grupoId}/metas`)
    //   .then(res => setData(res.data))
    //   .catch(err => setError(err.message))
    //   .finally(() => setLoading(false))
  }, [grupoId])

  return { data, loading, error }
}
