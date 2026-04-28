import { BrowserRouter, Routes, Route } from "react-router-dom";
import LayoutPrincipal from "../layouts/LayoutPrincipal";

import Grupos from "../pages/Grupos";
import DetalhesGrupo from "../pages/DetalhesGrupo";
import Perfil from "../pages/Perfil";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <LayoutPrincipal>
        <Routes>
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/grupo/:id" element={<DetalhesGrupo />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </LayoutPrincipal>
    </BrowserRouter>
  );
}
