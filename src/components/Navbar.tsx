import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { usePerfil } from "../Hooks/usePerfil";

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, usuario } = useContext(AuthContext);
    const perfil = usePerfil();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    // Links baseado no role e tipo do usuário
    const isSuperAdmin = usuario?.roles?.includes("ROLE_SUPER_ADMIN");
    const isFuncionario = perfil?.tipoUsuario === "Funcionario";

    const links = isSuperAdmin
        ? [
            { path: "/admin/escritorios", label: "Escritórios" },
            { path: "/admin/planos", label: "Planos" },
            { path: "/admin/assinaturas", label: "Assinaturas" },
          ]
        : [
            { path: "/", label: "Tarefas" },
            { path: "/demanda", label: "Demandas" },
            { path: "/cliente", label: "Clientes" },
            ...(isFuncionario ? [] : [{ path: "/funcionario", label: "Funcionários" }]),
            { path: "/agenda", label: "Agenda" },
          ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            {/* Navbar Principal */}
            <nav className="bg-white border-b-3 border-default text-muted p-3 sm:p-4 flex items-center justify-between sticky top-0 z-40">
                {/* Esquerda: Razão Social do Escritório */}
                <div className="flex-1 min-w-0">
                    {!isSuperAdmin && perfil?.nomeEscritorio && (
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                            {perfil.nomeEscritorio}
                        </span>
                    )}
                </div>

                {/* Centro: Links de Navegação (Desktop) */}
                <ul className="hidden md:flex space-x-2 lg:space-x-4 gap-2 lg:gap-4 justify-center flex-1">
                    {links.map((link) => (
                        <li key={link.path}>
                            <a
                                href={link.path}
                                className={`pb-2 transition-all duration-300 border-b-2 text-xs lg:text-sm ${
                                    isActive(link.path)
                                        ? "text-blue border-blue"
                                        : "hover:text-blue border-transparent hover:border-blue"
                                }`}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Direita: Botão Sair (Desktop) + Menu Mobile */}
                <div className="flex items-center gap-2 sm:gap-4 justify-end flex-1">
                    {/* Botão Sair Desktop */}
                    <button
                        onClick={handleLogout}
                        className="hidden sm:block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-xs sm:text-sm"
                    >
                        Sair
                    </button>

                    {/* Botão Menu Mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Menu"
                    >
                        <svg
                            className="w-5 h-5 sm:w-6 sm:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Menu Mobile */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b-2 border-gray-200">
                    <ul className="flex flex-col space-y-1 p-3">
                        {links.map((link) => (
                            <li key={link.path}>
                                <a
                                    href={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg transition text-sm font-medium ${
                                        isActive(link.path)
                                            ? "bg-blue text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                        {/* Botão Sair Mobile */}
                        <li>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full text-left px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition font-medium text-sm mt-2"
                            >
                                Sair
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
}

export default Navbar;