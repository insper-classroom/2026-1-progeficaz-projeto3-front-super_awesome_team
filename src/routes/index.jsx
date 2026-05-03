// Configuração central de rotas da aplicação
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Grupos } from '../pages/Grupos'
import { DetalhesGrupo } from '../pages/DetalhesGrupo'
import { Pessoal } from '../pages/Pessoal'
import { Perfil } from '../pages/Perfil'
import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Cadastro } from '../pages/Cadastro'
import { VerifyEmail } from '../pages/VerifyEmail'
import { LayoutPrincipal } from '../layouts/LayoutPrincipal'
import { UserProvider } from '../contexts/UserContext'
import { ThemeProvider } from '../contexts/ThemeContext'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <Routes>
            {/* Rotas públicas — sem sidebar */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />

            {/* Rotas autenticadas — com sidebar */}
            <Route path="/grupos" element={<LayoutPrincipal><Grupos /></LayoutPrincipal>} />
            <Route path="/grupos/:id" element={<LayoutPrincipal><DetalhesGrupo /></LayoutPrincipal>} />
            <Route path="/pessoal" element={<LayoutPrincipal><Pessoal /></LayoutPrincipal>} />
            <Route path="/perfil" element={<LayoutPrincipal><Perfil /></LayoutPrincipal>} />
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
