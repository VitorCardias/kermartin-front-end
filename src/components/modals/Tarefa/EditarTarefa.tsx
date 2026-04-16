import React, { useState, useEffect } from 'react';
import Titulo from '../../Titulo';
import AlertModal from '../AlertModal';
import { useTarefa, type TarefaAPI } from '../../../Hooks/useTarefa';
import { useEtapas } from '../../../Hooks/useEtapas';
import { useDemandas } from '../../../Hooks/useDemandas';
import {
  PrioridadeTarefa,
  StatusTarefaTipo,
  obterCorStatus,
  converterParaFormatoDateTimeLocal,
  converterDataTimeLocalParaAPI,
} from '../../../types/TiposTarefas';

type EditarTarefaProps = {
  isOpen: boolean;
  onClose: () => void;
  tarefa?: TarefaAPI;
  onSuccess?: (tarefaAtualizada?: any, acao?: 'editar' | 'excluir') => void;
};

const EditarTarefa: React.FC<EditarTarefaProps> = ({ isOpen, onClose, tarefa, onSuccess }) => {
  const { editarTarefa, deletarTarefa } = useTarefa();
  const { etapas } = useEtapas(tarefa?.demandaDTO?.id || '');
  const { demandas } = useDemandas();

  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    prioridade: 'Media' as const,
    status: 'Pendente' as const,
    inicioPrazo: '',
    conclusaoPrazo: '',
    porcentagemConclusao: 0,
    etapaDemandaDTO: { id: '' } as any,
    demandaDTO: { id: '' } as any,
  });

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    tipo: 'aviso' | 'erro' | 'sucesso';
    acaoConfirmar?: () => void;
  }>({ isOpen: false, titulo: '', mensagem: '', tipo: 'aviso' });

  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Carregar dados da tarefa ao abrir o modal
  useEffect(() => {
    if (isOpen && tarefa) {
      setFormData({
        id: tarefa.id,
        titulo: tarefa.titulo || '',
        descricao: tarefa.descricao || '',
        prioridade: (tarefa.prioridade || 'Media') as any,
        status: (tarefa.status || 'Pendente') as any,
        inicioPrazo: converterParaFormatoDateTimeLocal(tarefa.inicioPrazo),
        conclusaoPrazo: converterParaFormatoDateTimeLocal(tarefa.conclusaoPrazo),
        porcentagemConclusao: tarefa.porcentagemConclusao || 0,
        etapaDemandaDTO: tarefa.etapaDemandaDTO || { id: '' },
        demandaDTO: tarefa.demandaDTO || { id: '' },
      });
    }
  }, [isOpen, tarefa]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'porcentagemConclusao') {
      const valor = parseInt(value) || 0;
      setFormData({
        ...formData,
        [name]: Math.min(Math.max(valor, 0), 100),
      });
    } else if (name === 'demandaId') {
      setFormData({
        ...formData,
        demandaDTO: value ? { id: value } : { id: '' },
      });
    } else if (name === 'etapaId') {
      setFormData({
        ...formData,
        etapaDemandaDTO: value ? { id: value } : { id: '' },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = (): string | null => {
    if (!formData.titulo.trim()) {
      return 'Título da tarefa é obrigatório';
    }
    if (formData.titulo.trim().length < 3) {
      return 'Título deve ter no mínimo 3 caracteres';
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
      const tarefaPayload = {
        id: formData.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        prioridade: formData.prioridade,
        status: formData.status,
        porcentagemConclusao: formData.porcentagemConclusao,
        inicioPrazo: converterDataTimeLocalParaAPI(formData.inicioPrazo),
        conclusaoPrazo: converterDataTimeLocalParaAPI(formData.conclusaoPrazo),
        etapaDemandaDTO: formData.etapaDemandaDTO?.id ? formData.etapaDemandaDTO : null,
        demandaDTO: formData.demandaDTO?.id ? formData.demandaDTO : null,
        criador: tarefa?.criador,
      };

      await editarTarefa(formData.id, tarefaPayload as any);

      setAlert({
        isOpen: true,
        titulo: 'Sucesso',
        mensagem: 'Tarefa atualizada com sucesso!',
        tipo: 'sucesso',
        acaoConfirmar: () => {
          onSuccess?.(tarefaPayload, 'editar');
          onClose();
        },
      });
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: 'Erro ao editar tarefa. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletarTarefa(formData.id);

      setAlert({
        isOpen: true,
        titulo: 'Sucesso',
        mensagem: 'Tarefa deletada com sucesso!',
        tipo: 'sucesso',
        acaoConfirmar: () => {
          onSuccess?.(formData, 'excluir');
          onClose();
        },
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: 'Erro ao deletar tarefa. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = obterCorStatus(formData.status as any);

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-full bg-light border-b-3 border-default sticky top-0 z-10 flex items-center justify-between">
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Editar Tarefa</Titulo>
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
            {/* Coluna esquerda - Dados principais */}
            <div className="flex-1 space-y-4 p-8">
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Descrição Detalhada
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">
                    Vincular Demanda
                  </label>
                  <select
                    name="demandaId"
                    value={formData.demandaDTO?.id || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma demanda</option>
                    {demandas.map((demanda) => (
                      <option key={demanda.id} value={demanda.id}>
                        {demanda.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">
                    Vincular Etapa
                  </label>
                  <select
                    name="etapaId"
                    value={formData.etapaDemandaDTO?.id || ''}
                    onChange={handleChange}
                    disabled={!formData.demandaDTO?.id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione uma etapa</option>
                    {etapas && etapas.length > 0 ? (
                      etapas.map((etapa) => (
                        <option key={etapa.id} value={etapa.id}>
                          {etapa.titulo}
                        </option>
                      ))
                    ) : (
                      <option disabled>Nenhuma etapa disponível</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Coluna direita - Status, Prioridade e Datas */}
            <div className="lg:w-72 space-y-4 p-8 bg-slate-50">
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Status da Tarefa
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md font-semibold text-sm ${statusColors.bg} ${statusColors.text}`}
                >
                  {StatusTarefaTipo.map((status) => (
                    <option key={status} value={status}>
                      {status === 'RequerindoEquipe' ? 'Aguardando Equipe' : status === 'EmAndamento' ? 'Em Andamento' : status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Prioridade
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PrioridadeTarefa.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, prioridade: p as any })}
                      className={`px-4 py-2 rounded-md text-sm cursor-pointer transition ${
                        formData.prioridade === p
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p === 'Media' ? 'Média' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Data de Início
                </label>
                <input
                  type="datetime-local"
                  name="inicioPrazo"
                  value={formData.inicioPrazo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Prazo de Entrega
                </label>
                <input
                  type="datetime-local"
                  name="conclusaoPrazo"
                  value={formData.conclusaoPrazo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end p-6 border-t border-gray-300 items-center bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-md hover:brightness-110 cursor-pointer disabled:opacity-50 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de alerta de sucesso/erro */}
      <AlertModal
        isOpen={alert.isOpen}
        titulo={alert.titulo}
        mensagem={alert.mensagem}
        tipo={alert.tipo}
        onConfirm={() => {
          setAlert((prev) => ({ ...prev, isOpen: false }));
          if (alert.acaoConfirmar) {
            alert.acaoConfirmar();
          }
        }}
        mostrarBotaoCancelar={false}
      />

      {/* Modal de confirmação de exclusão */}
      <AlertModal
        isOpen={deleteConfirmOpen}
        titulo="Excluir Tarefa"
        mensagem={`Tem certeza que deseja excluir a tarefa "${formData.titulo}"? Esta ação não pode ser desfeita.`}
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

export default EditarTarefa;