import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const { login, error, carregando } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, senha);

    if (!error) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-900 p-6">
      <h2 className="text-3xl font-semibold mb-6">Login</h2>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded-md mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-4">
          <label htmlFor="username" className="block text-lg mb-2">
            Usuário:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="senha" className="block text-lg mb-2">
            Senha:
          </label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full px-6 py-3 bg-black text-white rounded-md transition duration-300 hover:bg-gray-800"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};
