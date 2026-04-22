import React, { useState, useEffect } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novaSenha: string) => Promise<void>; // A função que chama a API
  nomeUsuario?: string; // Para mostrar de quem estamos trocando a senha
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  nomeUsuario 
}) => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Limpa os campos toda vez que o modal abre
  useEffect(() => {
    if (isOpen) {
      setNovaSenha('');
      setConfirmacao('');
      setErro('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      await onSave(novaSenha);
      onClose(); // Fecha só se der sucesso
    } catch (error) {
      setErro("Erro ao alterar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Alterar Senha</h2>
        <p className="text-sm text-gray-500 mb-6">
          Definindo nova senha para: <span className="font-semibold text-gray-900">{nomeUsuario}</span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !novaSenha}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};