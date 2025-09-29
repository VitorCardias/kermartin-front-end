import React from "react";
import { useAuth } from "../hooks/useAuth";
import { usePerfil } from "../hooks/usePerfil";
import { useNavigate } from "react-router-dom";
import TabNavigator from "../components/TabNavigator";

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const perfil = usePerfil();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full max-w-screen-xl mx-auto bg-white text-gray-900 py-6 px-2">
      {/* Flex container para alinhar título e botão */}
      <div className="flex justify-between items-center mb-6">
        
        {perfil ? (
          <>
            <h2 className="text-3xl font-semibold">{perfil.nomeEscritorio}</h2>
            <div className="flex items-center gap-4">
              <p className="text-lg font-medium">
                Bem-vindo, <span className="font-bold">{perfil.username}</span>!
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800"
              >
                Sair
              </button>
            </div>
          </>
        ) : (
          <h2 className="text-3xl font-semibold">Dashboard</h2>
        )}

      </div>

      <div className="w-full text-left">
        {perfil ? (
          <>
            {/* Navegador de abas dinâmico */}
            <div className="w-full mt-6">
              <TabNavigator tipoUsuario={perfil.tipoUsuario} />
            </div>
          </>
        ) : (
          <p className="text-lg font-medium text-gray-600 mb-6">Carregando perfil...</p>
        )}
      </div>
    </div>
  );
};
