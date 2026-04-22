// Layout base: envolve todas as paginas com o sidebar
// {children} representa o conteúdo de cada página
import { Sidebar } from '../../components/Sidebar'

export function LayoutPrincipal({children}) {
    return (
        <div> 
            <Sidebar />
            {/* Conteúdo da página atual aparece aqui */}
            <main>{children}</main>
        </div>
    )
}