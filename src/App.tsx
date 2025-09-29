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
          
          {/* Rota Fallback */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
