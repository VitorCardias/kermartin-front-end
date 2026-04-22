import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { useToast } from '../components/Toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const { login, error, carregando } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      showToast(decodeURIComponent(errorParam), 'error');
    }
  }, [searchParams, showToast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const usuarioLogado = await login(username, senha);

    if (usuarioLogado) {
      if (usuarioLogado.roles.includes('ROLE_SUPER_ADMIN')) {
        navigate('/admin/escritorios');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">Kermartin</h1>
        <p className="mb-6 text-center text-gray-600">Sistema de Gestao de Tarefas</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite seu usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {carregando ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/esqueci-senha" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Esqueci minha senha
          </Link>
        </p>

        <p className="mt-6 text-center text-gray-600">
          Nao tem uma conta?{' '}
          <Link to="/cadastro" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
