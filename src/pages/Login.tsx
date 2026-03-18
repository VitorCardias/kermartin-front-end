import React, { useState } from "react";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const { login, error, carregando } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. A função 'login' agora retorna o usuário, então o guardamos em uma variável.
    const usuarioLogado = await login(username, senha);

    // 2. Verificamos se o login foi bem-sucedido (se o usuário não é nulo)
    if (usuarioLogado) {
      // 3. Verificamos se a lista de roles do usuário inclui 'ROLE_SUPER_ADMIN'
      if (usuarioLogado.roles.includes('ROLE_SUPER_ADMIN')) {
        // Se for admin, vai para o painel de admin
        navigate("/admin/escritorios");
      } else {
        // Senão, vai para o dashboard normal
        navigate("/");
      }
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Kermartin</h1>
        <p className="text-center text-gray-600 mb-6">Sistema de Gestão de Tarefas</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {carregando ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Não tem uma conta?{' '}
          <a href="/cadastro" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}
