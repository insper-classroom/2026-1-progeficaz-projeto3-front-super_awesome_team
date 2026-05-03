// Contexto de tema: alterna entre claro e escuro e persiste no localStorage
import { useState, useLayoutEffect } from 'react'
import { TemaContext } from './TemaContext'

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
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  )
}
