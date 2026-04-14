import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import Tarefas from "./pages/Tarefas";
import Demandas from "./pages/Demandas";
import DemandaDetalhes from "./pages/DemandaDetalhes";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Agenda from "./pages/Agenda";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import { AdminEscritorios } from "./pages/admin/AdminEscritorios";
import { AdminPlanos } from "./pages/admin/AdminPlanos";
import { AdminAssinaturas } from "./pages/admin/AdminAssinaturas";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteByType from "./components/ProtectedRouteByType";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

function AppContent() {
  const { estaAutenticado, carregando, usuario } = useContext(AuthContext);

  // Carregamento entre as rotas - redireciona para login se não autenticado
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Se não está autenticado, sempre redireciona para login
  if (!estaAutenticado) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Determinar rota padrão baseado no role
  const defaultRoute = usuario?.roles?.includes("ROLE_SUPER_ADMIN") 
    ? "/admin/escritorios" 
    : "/";


  return (
    <>
      {estaAutenticado && <Navbar />}
      <main className={estaAutenticado ? "grow bg-light" : ""}>
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path="/login" 
            element={<Navigate to="/" replace />}
          />
          <Route 
            path="/cadastro" 
            element={<Navigate to="/" replace />}
          />

          {/* Rotas privadas (requer autenticação) */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Tarefas />} />
            <Route path="/demanda" element={<Demandas />} />
            <Route path="/demanda/:id" element={<DemandaDetalhes />} />
            <Route path="/cliente" element={<Clientes />} />
            <Route path="/agenda" element={<Agenda />} />
          </Route>

          {/* Rota de Funcionários (apenas para Escritório) */}
          <Route element={<ProtectedRouteByType allowedTypes={["Escritorio"]} />}>
            <Route path="/funcionario" element={<Funcionarios />} />
          </Route>

          {/* Rotas de admin (requer role ROLE_SUPER_ADMIN) */}
          <Route element={<ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" />}>
            <Route path="/admin/escritorios" element={<AdminEscritorios />} />
            <Route path="/admin/planos" element={<AdminPlanos />} />
            <Route path="/admin/assinaturas" element={<AdminAssinaturas />} />
          </Route>

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
