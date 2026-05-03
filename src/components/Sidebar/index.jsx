// Barra lateral de navegação principal
import { Link } from 'react-router-dom'
import { CiGrid41, CiStop1 } from 'react-icons/ci'
import { BsSun, BsMoon } from 'react-icons/bs'
import styles from './Sidebar.module.css'
import { useUser } from '../../hooks/useUser'
import { useTema } from '../../hooks/useTema'

export function Sidebar() {
  const { foto } = useUser()
  const { tema, alternarTema } = useTema()

  let logoSidebar = '/logo_preta.png'
  if (tema === 'dark') {
    logoSidebar = '/logo_branca.png'
  }

  return (
    <nav className={styles.sidebar}>
      <img className={styles.logo} src={logoSidebar} alt="Logo" />

      <div className={styles.links}>
        {/* Links principais */}
        <Link to="/grupos"> <CiGrid41 /> <span>Grupos</span> </Link>
        <Link to="/pessoal"> <CiStop1 /> <span>Pessoal</span> </Link>
      </div>

      <div className={styles.spacer} />

      {/* Botão de alternância de tema */}
      <button className={styles.btnTema} onClick={alternarTema} aria-label="alternar tema">
        {tema === 'dark' ? <BsSun /> : <BsMoon />}
      </button>

      {/* Perfil no rodapé */}
      <Link to="/perfil">
        <img
          src={foto || '/imagem_padrao_perfil.png'}
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
        />
      </Link>
    </nav>
  )
}
