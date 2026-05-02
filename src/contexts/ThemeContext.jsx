// Contexto de tema: alterna entre claro e escuro e persiste no localStorage
import { createContext, useState, useContext, useLayoutEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Lê o tema salvo no localStorage ou usa claro como padrão
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'light')

  // useLayoutEffect roda antes do browser pintar — evita flash de tema errado
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  function alternarTema() {
    let novoTema = 'dark'
    if (tema === 'dark') {
      novoTema = 'light'
    }
    setTema(novoTema)
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para acessar o tema em qualquer componente
export function useTema() {
  return useContext(ThemeContext)
}
