// Hook para acessar o tema em qualquer componente.
import { useContext } from 'react'
import { TemaContext } from '../contexts/TemaContext'

export function useTema() {
  return useContext(TemaContext)
}
