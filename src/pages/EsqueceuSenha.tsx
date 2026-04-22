import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/AuthService';
import { useToast } from '../components/Toast';

export default function EsqueceuSenha() {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro('Por favor, digite seu e-mail.');
      return;
    }

    setCarregando(true);

    try {
      await authService.solicitarRecuperacaoSenha(email);
      showToast('Se o e-mail existir, um link foi enviado.', 'success');
      setEmail('');
      window.setTimeout(() => navigate('/login'), 1800);
    } catch {
      // Resposta generica para nao expor se o email existe
      showToast('Se o e-mail existir, um link foi enviado.', 'success');
      setEmail('');
      window.setTimeout(() => navigate('/login'), 1800);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">Kermartin</h1>
        <p className="mb-6 text-center text-gray-600">Recuperacao de senha</p>

        {erro && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{erro}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="seu.email@empresa.com"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {carregando ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Lembrou da senha?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  );
}
