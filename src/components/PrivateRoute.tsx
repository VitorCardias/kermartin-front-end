// Componente para proteger rotas que exigem autenticação
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PrivateRoute: React.FC = () => {
  const { estaAutenticado, carregando } = useAuth();
  
  if (carregando) {
    // Exibe um indicador de carregamento enquanto verifica a autenticação
    return <div>Carregando...</div>;
  }
  
  // Redireciona para login se não estiver autenticado
  return estaAutenticado ? <Outlet /> : <Navigate to="/login" />;
};
