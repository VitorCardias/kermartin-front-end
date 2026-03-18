// Componente para proteger rotas que exigem autenticação
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';

export const PrivateRoute: React.FC = () => {
  const { estaAutenticado, carregando } = useAuth();
  
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Redireciona para login se não estiver autenticado
  return estaAutenticado ? <Outlet /> : <Navigate to="/login" />;
};
