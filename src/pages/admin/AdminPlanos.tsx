import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/AuthService';
import { EditPlanoModal } from '../../components/modals/EditPlanoModal';
import { CreatePlanoModal } from '../../components/modals/CreatePlanoModal';


interface IPlanoAdmin {
  id: string;
  nome: string;
  limiteQtdFuncionarios: number;
}

export const AdminPlanos: React.FC = () => {
  // Estados para a lista de planos, carregamento e erros
  const [planos, setPlanos] = useState<IPlanoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para controlar os modais
  const [isEditModalAberto, setIsEditModalAberto] = useState(false);
  const [isCreateModalAberto, setIsCreateModalAberto] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<IPlanoAdmin | null>(null);

  
  const buscarPlanos = async () => {
    try {
      setCarregando(true);
      const response = await authApi.get('/plano');
      setPlanos(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar planos:", error);
      setErro("Não foi possível carregar a lista de planos.");
    } finally {
      setCarregando(false);
    }
  };

  // --- Funções para o Modal de Edição ---
  const handleEditClick = (plano: IPlanoAdmin) => {
    setPlanoSelecionado(plano);
    setIsEditModalAberto(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalAberto(false);
    setPlanoSelecionado(null);
  };

  const handleSaveEdit = async (data: IPlanoAdmin) => {
    try {
      // Usamos o endpoint PATCH que criamos
      await authApi.patch(`/plano/${data.id}`, data);
      // Atualização otimista
      setPlanos(planos.map(p => (p.id === data.id ? data : p)));
      console.log('Plano atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o plano:', error);
    }
  };

  // --- Funções para o Modal de Criação ---
  const handleSaveCreate = async (data: any) => {
    try {
      await authApi.post('/plano', data);
      // Recarrega a lista para incluir o novo plano
      await buscarPlanos(); 
      console.log('Plano criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar o plano:', error);
    }
  };

  // useEffect para buscar os dados iniciais
  useEffect(() => {
    buscarPlanos();
  }, []);

  if (carregando) {
    return <div className="p-8"><p>Carregando planos...</p></div>;
  }

  if (erro) {
    return <div className="p-8"><p className="text-red-500">{erro}</p></div>;
  }

  return (

    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel do Administrador - Planos</h1>
        <button
          onClick={() => setIsCreateModalAberto(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Cadastrar Novo Plano
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Plano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limite de Funcionários</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {planos.map(plano => (
              <tr key={plano.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plano.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plano.limiteQtdFuncionarios}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEditClick(plano)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modais */}
      {isEditModalAberto && (
        <EditPlanoModal
          isOpen={isEditModalAberto}
          plano={planoSelecionado}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
      )}

      {isCreateModalAberto && (
        <CreatePlanoModal
          isOpen={isCreateModalAberto}
          onClose={() => setIsCreateModalAberto(false)}
          onSave={handleSaveCreate}
        />
      )}

    </div>
    
  );
  
};