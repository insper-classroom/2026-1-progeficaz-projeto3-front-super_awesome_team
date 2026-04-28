// Barra lateral de navegação principal
import { Link } from 'react-router-dom'
import {CiGrid41, CiStop1} from 'react-icons/ci'
import styles from './Sidebar.module.css'
import { useUser } from '../../contexts/UserContext'

export function Sidebar() {
    const { foto } = useUser()
    return (
        <nav className={styles.sidebar}>
            <div>Logo</div>

            <div className={styles.links}> 
                {/* Links principais*/}
                <Link to="/grupos"> <CiGrid41/> </Link>
                <Link to="/pessoal"> <CiStop1/> </Link>
            </div>

            <div className={styles.spacer} />

            {/*Perfil no rodapé*/}
            <Link to="/perfil">
                <img
                    src={foto || '/imagem_padrao_perfil.png'}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
            </Link>

        </nav>
    )
}