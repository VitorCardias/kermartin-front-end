import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/AuthService';

// Interfaces para os tipos de dados
interface IPlano {
  id: string;
  nome: string;
}

interface CreateEscritorioData {
  nomeUsuario: string;
  emailCadastro: string;
  senha: string;
  razaoSocial: string;
  cnpj: string;
  planoDTO: {
    id: string;
  };
}

// Props que o modal recebe
interface CreateEscritorioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEscritorioData) => Promise<void>;
}

// Estado inicial do formulário
const ESTADO_INICIAL_VAZIO: CreateEscritorioData = {
  nomeUsuario: '',
  emailCadastro: '',
  senha: '',
  razaoSocial: '',
  cnpj: '',
  planoDTO: {
    id: '',
  },
};

export const CreateEscritorioModal: React.FC<CreateEscritorioModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateEscritorioData>(ESTADO_INICIAL_VAZIO);
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Busca a lista de planos disponíveis quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const buscarPlanos = async () => {
        try {
          const response = await authApi.get('/plano');
          setPlanos(response.data);
        } catch (error) {
          console.error("Erro ao buscar planos:", error);
        }
      };
      buscarPlanos();
      setFormData(ESTADO_INICIAL_VAZIO);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'planoId') {
      setFormData(prev => ({
        ...prev,
        planoDTO: { id: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    await onSave(formData);
    setCarregando(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Cadastrar Novo Escritório</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            <div>
              <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
              <input type="text" id="nomeUsuario" name="nomeUsuario" value={formData.nomeUsuario} onChange={handleChange} required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
              <label htmlFor="emailCadastro" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="emailCadastro" name="emailCadastro" value={formData.emailCadastro} onChange={handleChange} required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
              <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
              <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">Razão Social</label>
              <input type="text" id="razaoSocial" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input type="text" id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleChange} required className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            
            <div>
              <label htmlFor="plano" className="block text-sm font-medium text-gray-700">Plano</label>
              <select
                id="plano"
                name="planoId"
                value={formData.planoDTO.id}
                onChange={handleChange}
                required
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>Selecione um plano</option>
                {planos.map(plano => (
                  <option key={plano.id} value={plano.id}>{plano.nome}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Botões de Ação */}
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={carregando} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50">
              {carregando ? 'Criando...' : 'Criar Escritório'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
