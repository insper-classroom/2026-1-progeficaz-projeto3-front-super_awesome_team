// Barra lateral de navegação principal
import { Link } from 'react-router-dom'

export function Sidebar() {
    return (
        <nav>
            <div>Logo</div>

            <div> 
                {/* Links principais*/}
                <Link to="/grupo"> Grupos</Link>
                <Link to="/pessoal"> Pessoal </Link>
            </div>

            {/*Perfil no rodapé*/}
            <Link to="/perfil"> Perfil </Link>
        </nav>
    )
}