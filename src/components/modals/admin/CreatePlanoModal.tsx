import React, { useState, useEffect } from 'react';

interface CreatePlanoData {
  nome: string;
  limiteQtdFuncionarios: number | string; // String inicialmente para facilitar o input
}

// Props que o modal recebe
interface CreatePlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePlanoData) => Promise<void>;
}

const ESTADO_INICIAL_VAZIO: CreatePlanoData = {
  nome: '',
  limiteQtdFuncionarios: '', // Começa como string vazia
};

export const CreatePlanoModal: React.FC<CreatePlanoModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CreatePlanoData>(ESTADO_INICIAL_VAZIO);
  const [carregando, setCarregando] = useState(false);

  // Reseta o formulário sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setFormData(ESTADO_INICIAL_VAZIO);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Se for o limite, tenta converter para número, senão mantém como string
    const finalValue = name === 'limiteQtdFuncionarios' ? (value === '' ? '' : parseInt(value, 10)) : value;
    
    // Evita valores não numéricos ou negativos para o limite
    if (name === 'limiteQtdFuncionarios' && typeof finalValue === 'number' && (isNaN(finalValue) || finalValue < 0)) {
        return; // Não atualiza se não for um número válido ou for negativo
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Garante que o limite seja enviado como número
    const dataToSend = {
        ...formData,
        limiteQtdFuncionarios: Number(formData.limiteQtdFuncionarios) || 0 // Converte para número, default 0 se vazio/inválido
    };
    setCarregando(true);
    await onSave(dataToSend);
    setCarregando(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Cadastrar Novo Plano</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Campo Nome do Plano */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Plano</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Campo Limite de Funcionários */}
            <div>
              <label htmlFor="limiteQtdFuncionarios" className="block text-sm font-medium text-gray-700">Limite de Funcionários</label>
              <input
                type="number"
                id="limiteQtdFuncionarios"
                name="limiteQtdFuncionarios"
                value={formData.limiteQtdFuncionarios}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {carregando ? 'Criando...' : 'Criar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};