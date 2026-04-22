import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteByType from './components/ProtectedRouteByType';
import { PrivateRoute } from './components/PrivateRoute';

const Tarefas = lazy(() => import('./pages/Tarefas'));
const Demandas = lazy(() => import('./pages/Demandas'));
const DemandaDetalhes = lazy(() => import('./pages/DemandaDetalhes'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Funcionarios = lazy(() => import('./pages/Funcionarios'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Login = lazy(() => import('./pages/Login'));
const Cadastro = lazy(() => import('./pages/Cadastro'));
const AdminEscritorios = lazy(() =>
  import('./pages/admin/AdminEscritorios').then((module) => ({ default: module.AdminEscritorios }))
);
const AdminPlanos = lazy(() =>
  import('./pages/admin/AdminPlanos').then((module) => ({ default: module.AdminPlanos }))
);
const AdminAssinaturas = lazy(() =>
  import('./pages/admin/AdminAssinaturas').then((module) => ({ default: module.AdminAssinaturas }))
);
const Navbar = lazy(() => import('./components/Navbar'));
const Planos = lazy(() => import('./pages/Planos'));
const EsqueceuSenha = lazy(() => import('./pages/EsqueceuSenha'));
const RedefinirSenha = lazy(() => import('./pages/RedefinirSenha'));
const PagamentoSucesso = lazy(() => import('./pages/PagamentoSucesso'));
const PagamentoCancelado = lazy(() => import('./pages/PagamentoCancelado'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-light">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue"></div>
  </div>
);

function AppContent() {
  const { estaAutenticado, carregando, usuario } = useContext(AuthContext);
  const location = useLocation();

  if (carregando) {
    return <LoadingScreen />;
  }

  const defaultRoute = usuario?.roles?.includes('ROLE_SUPER_ADMIN') ? '/admin/escritorios' : '/';
  const esconderNavbar = location.pathname.startsWith('/planos');

  return (
    <Suspense fallback={<LoadingScreen />}>
      <>
        {estaAutenticado && !esconderNavbar && <Navbar />}
        <main className={estaAutenticado ? 'grow bg-light' : ''}>
          <Routes>
            <Route
              path="/login"
              element={estaAutenticado ? <Navigate to={defaultRoute} replace /> : <Login />}
            />
            <Route
              path="/cadastro"
              element={estaAutenticado ? <Navigate to="/planos" replace /> : <Cadastro />}
            />
            <Route
              path="/esqueci-senha"
              element={estaAutenticado ? <Navigate to={defaultRoute} replace /> : <EsqueceuSenha />}
            />
            <Route
              path="/redefinir-senha"
              element={estaAutenticado ? <Navigate to={defaultRoute} replace /> : <RedefinirSenha />}
            />

            <Route path="/planos" element={<Planos />} />
            <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
            <Route path="/pagamento/cancelado" element={<PagamentoCancelado />} />

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Tarefas />} />
              <Route path="/demanda" element={<Demandas />} />
              <Route path="/demanda/:id" element={<DemandaDetalhes />} />
              <Route path="/cliente" element={<Clientes />} />
              <Route path="/agenda" element={<Agenda />} />
            </Route>

            <Route element={<ProtectedRouteByType allowedTypes={['Escritorio']} />}>
              <Route path="/funcionario" element={<Funcionarios />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" />}>
              <Route path="/admin/escritorios" element={<AdminEscritorios />} />
              <Route path="/admin/planos" element={<AdminPlanos />} />
              <Route path="/admin/assinaturas" element={<AdminAssinaturas />} />
            </Route>

            <Route
              path="*"
              element={
                estaAutenticado ? <Navigate to={defaultRoute} replace /> : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </main>
      </>
    </Suspense>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="flex min-h-screen flex-col">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
