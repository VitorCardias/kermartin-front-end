import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { usePerfil } from '../Hooks/usePerfil';

interface ProtectedRouteByTypeProps {
  allowedTypes: string[];
}

export default function ProtectedRouteByType({ allowedTypes }: ProtectedRouteByTypeProps) {
  const { estaAutenticado, carregando: authCarregando } = useAuth();
  const perfil = usePerfil();

  const carregando = authCarregando || !perfil;

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!estaAutenticado || !perfil?.tipoUsuario || !allowedTypes.includes(perfil.tipoUsuario)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

