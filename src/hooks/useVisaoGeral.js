import { useState, useEffect } from 'react'
import { getMockVisaoGeral } from '../services/mockData'
// import api from '../services/api'  // descomentar quando o backend estiver pronto

export function useVisaoGeral(grupoId, periodo = '30d') {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!grupoId) return
    setLoading(true)
    setError(null)

    // --- mock (remover quando o backend estiver pronto) ---
    const resultado = getMockVisaoGeral(grupoId, periodo)
    setData(resultado)
    setLoading(false)

    // --- (descomentar quando o backend estiver pronto) ---
    // api.get(`/grupos/${grupoId}/resumo`, { params: { periodo } })
    //   .then(res => setData(res.data))
    //   .catch(err => setError(err.message))
    //   .finally(() => setLoading(false))
  }, [grupoId, periodo])

  return { data, loading, error }
}
