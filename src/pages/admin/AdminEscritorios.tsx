import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/AuthService'; // Ajuste o caminho se necessário
import { EditEscritorioModal } from '../../components/modals/EditEscritorioModal';
import { CreateEscritorioModal } from '../../components/modals/CreateEscritorioModal';
import type { StatusConta } from '../../types/StatusConta';
import { ChangePasswordModal } from '../../components/modals/ChangeEscritorioPasswordModal';

// Interface para os dados do escritório
interface EscritorioAdmin {
  id: string;
  nomeUsuario: string;
  razaoSocial: string;
  cnpj: string;
  emailCadastro: string;
  statusConta: StatusConta;

}

export const AdminEscritorios: React.FC = () => {
  // Estados para a lista de escritórios, carregamento e erros
  const [escritorios, setEscritorios] = useState<EscritorioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para controlar os modais
  const [isEditModalAberto, setIsEditModalAberto] = useState(false);
  const [isCreateModalAberto, setIsCreateModalAberto] = useState(false);
  const [escritorioSelecionado, setEscritorioSelecionado] = useState<EscritorioAdmin | null>(null);
  const [isPasswordModalAberto, setIsPasswordModalAberto] = useState(false);

  // --- Funções para o Modal de Edição ---
  const handleEditClick = (escritorio: EscritorioAdmin) => {
    setEscritorioSelecionado(escritorio);
    setIsEditModalAberto(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalAberto(false);
    setEscritorioSelecionado(null);
  };

  const handleSaveEdit = async (data: EscritorioAdmin) => {
    try {
      await authApi.put(`/escritorio/${data.id}`, data);
      setEscritorios(escritorios.map(e => (e.id === data.id ? data : e)));
      console.log('Escritório atualizado com sucesso!');
      handleCloseEditModal();
    } catch (error) {
      console.error('Erro ao atualizar o escritório:', error);
      // TODO: implementar um setErro ou um toast aqui para o usuário ver que falhou
    }
  };

  // --- Funções para o Modal de Criação ---
  const handleSaveCreate = async (data: any) => {
    try {
      await authApi.post('/auth/escritorio/register', data);
      const updatedResponse = await authApi.get('/escritorio');
      setEscritorios(updatedResponse.data);
      console.log('Escritório criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar o escritório:', error);
    }
  };

  // --- Funções para segurança ---
  const handlePasswordClick = (escritorio: EscritorioAdmin) => {
    setEscritorioSelecionado(escritorio);
    setIsPasswordModalAberto(true);
  };

  const handleSavePassword = async (novaSenha: string) => {
    if (!escritorioSelecionado) return;
    
    try {

      await authApi.patch(`/escritorio/${escritorioSelecionado.id}/alterar-senha`, {
        novaSenha: novaSenha
      });
      console.log("Senha alterada com sucesso!");

    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar a senha."); // Um feedback simples
    }
  };

  // useEffect para buscar os dados da API
  useEffect(() => {
    const buscarEscritorios = async () => {
      try {
        setCarregando(true);
        const response = await authApi.get('/escritorio');
        setEscritorios(response.data);
      } catch (error: any) {
        console.error("Erro ao buscar escritórios:", error);
        setErro("Não foi possível carregar a lista de escritórios.");
      } finally {
        setCarregando(false);
      }
    };
    buscarEscritorios();
  }, []);

  if (carregando) {
    return <div className="p-8"><p>Carregando escritórios...</p></div>;
  }

  if (erro) {
    return <div className="p-8"><p className="text-red-500">{erro}</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel do Administrador - Escritórios</h1>
        <button
          onClick={() => setIsCreateModalAberto(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Cadastrar Novo
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {escritorios.map(escritorio => (
              <tr key={escritorio.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{escritorio.razaoSocial}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{escritorio.cnpj}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{escritorio.emailCadastro}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  
                  {/* Botão Editar */}
                  <button 
                    onClick={() => handleEditClick(escritorio)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>

                  {/* Botão Senha */}
                  <button 
                    onClick={() => handlePasswordClick(escritorio)}
                    className="text-red-600 hover:text-red-900 ml-4"
                    title="Alterar Senha Administrativa"
                  >
                    Senha
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <EditEscritorioModal
        isOpen={isEditModalAberto}
        escritorio={escritorioSelecionado}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* Modal de Alteração de Senha */}
      <ChangePasswordModal
        isOpen={isPasswordModalAberto}
        onClose={() => {
          setIsPasswordModalAberto(false);
          setEscritorioSelecionado(null);
        }}
        onSave={handleSavePassword}
        nomeUsuario={escritorioSelecionado?.razaoSocial || 'Usuário'}
      />

      {/* Modal de Criação */}
      <CreateEscritorioModal
        isOpen={isCreateModalAberto}
        onClose={() => setIsCreateModalAberto(false)}
        onSave={handleSaveCreate}
      />
    </div>
  );
  
};