// Barra lateral de navegação principal
import { Link } from 'react-router-dom'
import {CiGrid41, CiStop1} from 'react-icons/ci'
import { MdEmojiPeople} from 'react-icons/md'
import styles from './Sidebar.module.css'

export function Sidebar() {
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
            <Link to="/perfil"> <MdEmojiPeople/> </Link>
        </nav>
    )
}