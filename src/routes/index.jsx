// Configuração central de rotas da aplicação
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Grupos} from '../pages/Grupos'
import { DetalhesGrupo } from '../pages/DetalhesGrupo'
import { Pessoal } from '../pages/Pessoal'
import { Perfil } from '../pages/Perfil'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/grupos" element={< Grupos />} />
        <Route path="/grupos/:id" element={< DetalhesGrupo />} />
        <Route path="/pessoal" element={< Pessoal />} />
        <Route path="/perfil" element={< Perfil />} />
      </Routes>
    </BrowserRouter>
  )
}
