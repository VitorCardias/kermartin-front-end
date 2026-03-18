import React, { useState, useEffect } from 'react';
import Titulo from '../../Titulo';
import AlertModal from '../AlertModal';
import { useDemandas } from '../../../Hooks/useDemandas';
import { useClientes } from '../../../Hooks/useClientes';
import { useFuncionarios } from '../../../Hooks/useFuncionarios';
import { PrioridadeDemanda, converterParaFormatoDateTimeLocal } from '../../../types/TiposDemandas';

type EditarDemandaProps = {
  isOpen: boolean;
  onClose: () => void;
  demanda?: any;
  onSuccess?: () => void;
};

const EditarDemanda: React.FC<EditarDemandaProps> = ({ isOpen, onClose, demanda, onSuccess }) => {
  const { editarDemanda, deletarDemanda } = useDemandas();
  const { clientes } = useClientes();
  const { funcionarios } = useFuncionarios();

  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    clienteDto: undefined as any,
    prioridadeDemanda: 'Media' as const,
    statusDemanda: 'RequerindoEquipe' as const,
    inicioPrazo: '',
    conclusaoPrazo: '',
    porcentagemConclusao: 0,
    responsavelList: [] as any[],
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'aviso' as 'aviso' | 'erro' | 'sucesso',
  });

  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Carregar dados da demanda quando modal abre
  useEffect(() => {
    if (isOpen && demanda) {
      setFormData({
        id: demanda.id,
        titulo: demanda.titulo || '',
        descricao: demanda.descricao || '',
        clienteDto: demanda.clienteDto,
        prioridadeDemanda: demanda.prioridadeDemanda || 'Media',
        statusDemanda: demanda.statusDemanda || 'RequerindoEquipe',
        inicioPrazo: converterParaFormatoDateTimeLocal(demanda.inicioPrazo),
        conclusaoPrazo: converterParaFormatoDateTimeLocal(demanda.conclusaoPrazo),
        porcentagemConclusao: demanda.porcentagemConclusao || 0,
        responsavelList: demanda.responsavelList || [],
      });
    }
  }, [isOpen, demanda]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'porcentagemConclusao') {
      setFormData({
        ...formData,
        [name]: Math.min(100, Math.max(0, Number(value)))
      });
    } else if (name === 'clienteId') {
      const clienteSelecionado = clientes?.find(c => c.id === value);
      if (clienteSelecionado) {
        setFormData({
          ...formData,
          clienteDto: clienteSelecionado
        });
      }
    } else if (name === 'responsavelId') {
      const funcionarioSelecionado = funcionarios?.find(f => f.id === value);
      if (funcionarioSelecionado && !formData.responsavelList.find((r: any) => r.id === funcionarioSelecionado.id)) {
        setFormData({
          ...formData,
          responsavelList: [...formData.responsavelList, funcionarioSelecionado]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const removeResponsavel = (responsavelId: string) => {
    setFormData({
      ...formData,
      responsavelList: formData.responsavelList.filter((r: any) => r.id !== responsavelId)
    });
  };

  const validateForm = (): string | null => {
    if (!formData.titulo.trim()) {
      return 'Título da demanda é obrigatório';
    }
    if (formData.titulo.trim().length < 3) {
      return 'Título deve ter no mínimo 3 caracteres';
    }
    if (!formData.clienteDto) {
      return 'Cliente é obrigatório';
    }
    if (formData.inicioPrazo && formData.conclusaoPrazo) {
      if (new Date(formData.inicioPrazo) > new Date(formData.conclusaoPrazo)) {
        return 'Data de início não pode ser maior que data de conclusão';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setAlert({
        isOpen: true,
        titulo: 'Erro na Validação',
        mensagem: validationError,
        tipo: 'erro',
      });
      return;
    }

    setLoading(true);
    try {
      const formatarDataParaAPI = (dateTimeStr: string | ''): string | null => {
        if (!dateTimeStr) return null;
        const date = new Date(dateTimeStr);
        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const ano = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, "0");
        const minutos = String(date.getMinutes()).padStart(2, "0");
        const segundos = String(date.getSeconds()).padStart(2, "0");
        return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
      };

      const demandaPayload: any = {
        id: formData.id,
        criador: { id: '' }, // Será mantido do original
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        clienteDto: formData.clienteDto,
        prioridadeDemanda: formData.prioridadeDemanda,
        statusDemanda: formData.statusDemanda,
        inicioPrazo: formatarDataParaAPI(formData.inicioPrazo),
        conclusaoPrazo: formatarDataParaAPI(formData.conclusaoPrazo),
        porcentagemConclusao: formData.porcentagemConclusao,
        responsavelList: formData.responsavelList,
      };

      const resultado = await editarDemanda(demandaPayload);

      if (resultado) {
        setAlert({
          isOpen: true,
          titulo: 'Sucesso',
          mensagem: 'Demanda atualizada com sucesso!',
          tipo: 'sucesso',
        });
        onSuccess?.();
        setTimeout(() => onClose(), 1500);
      } else {
        setAlert({
          isOpen: true,
          titulo: 'Erro',
          mensagem: 'Erro ao atualizar demanda. Tente novamente.',
          tipo: 'erro',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar demanda:', error);
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: 'Erro ao atualizar demanda. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const resultado = await deletarDemanda(formData.id);

      if (resultado) {
        setAlert({
          isOpen: true,
          titulo: 'Sucesso',
          mensagem: 'Demanda deletada com sucesso!',
          tipo: 'sucesso',
        });
        onSuccess?.();
        setTimeout(() => onClose(), 1500);
      } else {
        setAlert({
          isOpen: true,
          titulo: 'Erro',
          mensagem: 'Erro ao deletar demanda. Tente novamente.',
          tipo: 'erro',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar demanda:', error);
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: 'Erro ao deletar demanda. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className='w-full bg-light border-b-3 border-default sticky top-0 z-10 flex items-center justify-between'>
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Editar Demanda</Titulo>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="px-4 py-2 mr-6 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-50 text-sm font-medium cursor-pointer"
            disabled={loading}
          >
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Coluna Esquerda */}
            <div className="flex-1 space-y-4 p-8">
              {/* Título */}
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Título da Demanda *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Digite o título da demanda"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Descrição Detalhada</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Digite a descrição da demanda"
                  rows={5}
                />
              </div>

              {/* Cliente e Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cliente */}
                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">Vincular a Cliente *</label>
                  <select
                    name="clienteId"
                    value={formData.clienteDto?.id || ''}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes?.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">Equipe Responsável</label>
                  <select
                    name="responsavelId"
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios?.map((funcionario) => (
                      <option key={funcionario.id} value={funcionario.id}>
                        {funcionario.nomeCompleto || funcionario.nomeUsuario}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Responsáveis adicionados */}
              {formData.responsavelList.length > 0 && (
                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">Membros da Equipe</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.responsavelList.map((responsavel: any) => (
                      <div key={responsavel.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                        {responsavel.nome}
                        <button
                          type="button"
                          onClick={() => removeResponsavel(responsavel.id)}
                          className="font-bold text-lg hover:text-blue-900 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna Direita */}
            <div 
                className="lg:w-72 space-y-4 p-8"
                style={{
                    backgroundColor: '#F1F5F9',
                }}
            >
              {/* Status */}
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Status da Tarefa</label>
                <select
                  name="statusDemanda"
                  value={formData.statusDemanda}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="RequerindoEquipe">Aguardando</option>
                  <option value="EmAndamento">Em Andamento</option>
                  <option value="Finalizada">Finalizado</option>
                  <option value="Atrasada">Atrasada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Prioridade</label>
                <div className="flex gap-2 flex-wrap">
                  {PrioridadeDemanda.map((prioridade) => (
                    <button
                      key={prioridade}
                      type="button"
                      onClick={() => setFormData({ ...formData, prioridadeDemanda: prioridade as any })}
                      className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition ${
                        formData.prioridadeDemanda === prioridade
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {prioridade === 'Media' ? 'Média' : prioridade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data de Início */}
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Data de Início</label>
                <input
                  type="datetime-local"
                  name="inicioPrazo"
                  value={formData.inicioPrazo}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Data de Entrega */}
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Prazo de Entrega</label>
                <input
                  type="datetime-local"
                  name="conclusaoPrazo"
                  value={formData.conclusaoPrazo}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-6 pb-6 pr-6 border-t border-gray-300 items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm font-medium cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:brightness-110 cursor-pointer disabled:opacity-50 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        titulo={alert.titulo}
        mensagem={alert.mensagem}
        tipo={alert.tipo}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
        mostrarBotaoCancelar={false}
      />

      <AlertModal
        isOpen={deleteConfirmOpen}
        titulo="Excluir Demanda"
        mensagem={`Tem certeza que deseja excluir a demanda "${formData.titulo}"? Esta ação não pode ser desfeita.`}
        tipo="erro"
        botaoConfirmar="Excluir"
        botaoCancelar="Cancelar"
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          handleDelete();
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default EditarDemanda;