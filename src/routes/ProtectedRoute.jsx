import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { autenticado, carregandoUsuario } = useUser()

  if (carregandoUsuario) {
    return <div>Carregando...</div>
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
