// Hook para acessar os dados do usuario em qualquer componente.
import { useContext } from 'react'
import { UsuarioContext } from '../contexts/UsuarioContext'

export function useUser() {
  return useContext(UsuarioContext)
}
