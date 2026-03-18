import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';

interface ProtectedRouteProps {
  requiredRole: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { usuario, estaAutenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (!estaAutenticado || !usuario?.roles.includes(requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
