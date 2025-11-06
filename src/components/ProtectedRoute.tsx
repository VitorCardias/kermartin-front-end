import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  requiredRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { usuario, estaAutenticado, carregando } = useAuth();

  // --- ADICIONE ESTE CONSOLE.LOG ---
  /*
  console.log('ProtectedRoute DEBUG:', {
    carregando,
    estaAutenticado,
    requiredRole,
    rolesDoUsuario: usuario?.roles
  });
  */
  // ---------------------------------

  // Se o contexto ainda está carregando a informação de autenticação, mostre uma mensagem.
  if (carregando) {
    return <div>Carregando...</div>;
  }

  // Se o usuário não está autenticado OU se o array de roles do usuário não inclui a role necessária, redirecione para o login.
  if (!estaAutenticado || !usuario?.roles.includes(requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário passou por todas as verificações, renderize a página que está sendo protegida.
  return <Outlet />;
};
