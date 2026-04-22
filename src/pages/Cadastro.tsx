import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import { type CadastroParams } from '../types/auth';

type CadastroFormData = Omit<CadastroParams, 'planoDTO'>;

export default function Cadastro() {
  const [formData, setFormData] = useState<CadastroFormData>({
    nomeUsuario: '',
    emailCadastro: '',
    senha: '',
    tipoUsuario: 'Escritorio',
    razaoSocial: '',
    cnpj: '',
  });

  const { error, carregando, cadastroComLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usuario = await cadastroComLogin(formData, formData.nomeUsuario, formData.senha);

    if (usuario) {
      navigate('/planos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">Kermartin</h1>
        <p className="mb-6 text-center text-gray-600">Cadastro de Escritorio</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="nomeUsuario" className="mb-1 block text-sm font-medium text-gray-700">
              Nome de Usuario
            </label>
            <input
              id="nomeUsuario"
              type="text"
              name="nomeUsuario"
              value={formData.nomeUsuario}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite seu nome de usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="emailCadastro" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="emailCadastro"
              type="email"
              name="emailCadastro"
              value={formData.emailCadastro}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite seu email"
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
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div>
            <label htmlFor="razaoSocial" className="mb-1 block text-sm font-medium text-gray-700">
              Razao Social
            </label>
            <input
              id="razaoSocial"
              type="text"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite a razao social"
              required
            />
          </div>

          <div>
            <label htmlFor="cnpj" className="mb-1 block text-sm font-medium text-gray-700">
              CNPJ
            </label>
            <input
              id="cnpj"
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite o CNPJ"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {carregando ? 'Cadastrando...' : 'Continuar'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Ja tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
