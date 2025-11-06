// Configuração de rotas da aplicação
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Dashboard } from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { PrivateRoute } from './components/PrivateRoute';
import Home from './pages/Home';
import { AdminEscritorios } from './pages/admin/AdminEscritorios';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminPlanos } from './pages/admin/AdminPlanos';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />

          {/* Rota pública para login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota pública para cadastro */}
          <Route path="/cadastro" element={<Cadastro />} />
          
          {/* Rotas protegidas - apenas usuários autenticados */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" />}>
            <Route path="/admin/escritorios" element={<AdminEscritorios />} />
            <Route path="/admin/planos" element={<AdminPlanos />} />
          </Route>
          
          {/* Rota Fallback */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
