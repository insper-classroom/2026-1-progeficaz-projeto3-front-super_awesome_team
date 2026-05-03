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
import { AuthCallback } from '../pages/AuthCallback'
import { EmailVerified } from '../pages/EmailVerified'
import { LayoutPrincipal } from '../layouts/LayoutPrincipal'
import { UserProvider } from '../contexts/UserContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ProtectedRoute } from './ProtectedRoute'

function rotaProtegida(children) {
  return (
    <ProtectedRoute>
      <LayoutPrincipal>{children}</LayoutPrincipal>
    </ProtectedRoute>
  )
}

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
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Rotas autenticadas — com sidebar */}
            <Route path="/grupos" element={rotaProtegida(<Grupos />)} />
            <Route path="/grupos/:id" element={rotaProtegida(<DetalhesGrupo />)} />
            <Route path="/pessoal" element={rotaProtegida(<Pessoal />)} />
            <Route path="/perfil" element={rotaProtegida(<Perfil />)} />
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
