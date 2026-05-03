// Provider dos dados do usuario compartilhados entre os componentes.
import { useState } from 'react'
import { UsuarioContext } from './UsuarioContext'

export function UserProvider({ children }) {
  const [foto, setFoto] = useState(null) // foto de perfil do usuário

  return (
    <UsuarioContext.Provider value={{ foto, setFoto }}>
      {children}
    </UsuarioContext.Provider>
  )
}
