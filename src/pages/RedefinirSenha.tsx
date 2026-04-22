import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../api/AuthService';
import { useToast } from '../components/Toast';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setErro('Token invalido ou expirado. Solicite um novo link.');
      window.setTimeout(() => navigate('/esqueci-senha'), 2500);
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!token) {
      setErro('Token invalido ou expirado.');
      return;
    }

    if (!novaSenha.trim() || !confirmarSenha.trim()) {
      setErro('Preencha os dois campos de senha.');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no minimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas nao correspondem.');
      return;
    }

    setCarregando(true);

    try {
      await authService.redefinirSenha(token, novaSenha);
      showToast('Senha redefinida com sucesso!', 'success');
      window.setTimeout(() => navigate('/login'), 1800);
    } catch {
      setErro('Nao foi possivel redefinir a senha. Solicite um novo link.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">Kermartin</h1>
        <p className="mb-6 text-center text-gray-600">Redefinir senha</p>

        {erro && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{erro}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="novaSenha" className="mb-1 block text-sm font-medium text-gray-700">
              Nova senha
            </label>
            <input
              type="password"
              id="novaSenha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite sua nova senha"
            />
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="mb-1 block text-sm font-medium text-gray-700">
              Confirmar senha
            </label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirme sua nova senha"
            />
          </div>

          <button
            type="submit"
            disabled={carregando || !token}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {carregando ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  );
}
