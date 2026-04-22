import React, { useState, useEffect } from 'react';

interface EditPlanoData {
  id: string;
  nome: string;
  limiteQtdFuncionarios: number | string;
}

// "Contrato" de dados que o onSave VAI ENVIAR.
interface PlanoSaveData {
  id: string;
  nome: string;
  limiteQtdFuncionarios: number; 
}

interface EditPlanoModalProps {
  plano: EditPlanoData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlanoSaveData) => Promise<void>;
}

export const EditPlanoModal: React.FC<EditPlanoModalProps> = ({ plano, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EditPlanoData | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (isOpen && plano) {
      setFormData({
          ...plano,
          limiteQtdFuncionarios: String(plano.limiteQtdFuncionarios)
      });
    } else {
        setFormData(null);
    }
  }, [plano, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
        const finalValue = name === 'limiteQtdFuncionarios' ? (value === '' ? '' : parseInt(value, 10)) : value;
        
        if (name === 'limiteQtdFuncionarios' && typeof finalValue === 'number' && (isNaN(finalValue) || finalValue < 0)) {
            return;
        }

        setFormData(prev => ({ ...prev!, [name]: finalValue }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) { 
        const dataToSend = {
            ...formData,
            limiteQtdFuncionarios: Number(formData.limiteQtdFuncionarios) || 0
        };
        setCarregando(true);
        await onSave(dataToSend);
        setCarregando(false);
        onClose();
    }
  };

  if (!isOpen || !formData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
      
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Editar Plano: {plano?.nome}</h2> {/* Título dinâmico */}
        
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
              {carregando ? 'Salvando...' : 'Salvar Alterações'} {/* Texto do botão ajustado */}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};