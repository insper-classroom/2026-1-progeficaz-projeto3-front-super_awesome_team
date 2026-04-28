import { createContext, useState, useContext } from 'react'

// contexto que compartilha os dados do usuário entre os componentes
const UserContext = createContext()

export function UserProvider({ children }) {
  const [foto, setFoto] = useState(null) // foto de perfil do usuário

  return (
    <UserContext.Provider value={{ foto, setFoto }}>
      {children}
    </UserContext.Provider>
  )
}

// hook para acessar o contexto em qualquer componente
export function useUser() {
  return useContext(UserContext)
}
