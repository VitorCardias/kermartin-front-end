import React, { useState, useEffect } from 'react';
import Titulo from '../../Titulo';
import AlertModal from '../AlertModal';
import { useTarefa, type TarefaAPI } from '../../../Hooks/useTarefa';
import { useEtapas } from '../../../Hooks/useEtapas';
import { useDemandas } from '../../../Hooks/useDemandas';
import { useFuncionarios } from '../../../Hooks/useFuncionarios';
import { useEquipeTarefa } from '../../../Hooks/useEquipeTarefa';
import { authApi } from '../../../api/AuthService';
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

type MembroFila = {
  funcionarioId: string;
  nome: string;
  vinculoId?: string;
  status: 'ativo' | 'novo' | 'remover';
};

type FormDataTarefa = {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
  inicioPrazo: string;
  conclusaoPrazo: string;
  porcentagemConclusao: number;
  etapaDemandaDTO: { id: string } | any;
  demandaDTO: { id: string } | any;
};

const EditarTarefa: React.FC<EditarTarefaProps> = ({ isOpen, onClose, tarefa, onSuccess }) => {
  const { editarTarefa, deletarTarefa } = useTarefa();
  const { etapas } = useEtapas(tarefa?.demandaDTO?.id || '');
  const { demandas } = useDemandas();
  const { funcionarios } = useFuncionarios();
  const { membrosEquipe } = useEquipeTarefa(tarefa?.id || '');

  const [formData, setFormData] = useState<FormDataTarefa>({
    id: '',
    titulo: '',
    descricao: '',
    prioridade: 'Media',
    status: 'RequerindoEquipe',
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
  const [membrosForm, setMembrosForm] = useState<MembroFila[]>([]);

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

  useEffect(() => {
    if (membrosEquipe && membrosEquipe.length > 0) {
      const equipeFormatada: MembroFila[] = membrosEquipe.map((m) => ({
        vinculoId: m.id,
        funcionarioId: m.funcionarioDTO.id,
        nome: m.funcionarioDTO.nomeCompleto,
        status: 'ativo',
      }));
      setMembrosForm(equipeFormatada);
    } else {
      setMembrosForm([]);
    }
  }, [membrosEquipe]);

  useEffect(() => {
    setFormData((prev) => {
      if (prev.status === 'Finalizada' || prev.status === 'Cancelada') {
        return prev;
      }

      const membrosAtivos = membrosForm.filter((m) => m.status !== 'remover').length;
      const dataAtual = new Date();
      const estaAtrasado = prev.conclusaoPrazo ? dataAtual > new Date(prev.conclusaoPrazo) : false;

      let novoStatus = prev.status;

      if (estaAtrasado) {
        novoStatus = 'Atrasada';
      } else if (membrosAtivos > 0) {
        novoStatus = 'EmAndamento';
      } else {
        novoStatus = 'RequerindoEquipe';
      }

      if (novoStatus !== prev.status) {
        return { ...prev, status: novoStatus as any };
      }

      return prev;
    });
  }, [membrosForm, formData.conclusaoPrazo]);

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
    } else if (name === 'responsavelId') {
      const func = funcionarios?.find((f) => f.id === value);
      if (func) {
        setMembrosForm((prev) => {
          const existe = prev.find((m) => m.funcionarioId === func.id);
          if (existe) {
            if (existe.status === 'remover') {
              return prev.map((m) =>
                m.funcionarioId === func.id ? { ...m, status: m.vinculoId ? 'ativo' : 'novo' } : m
              );
            }
            return prev;
          }

          return [...prev, { funcionarioId: func.id, nome: func.nomeCompleto, status: 'novo' }];
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const removeResponsavel = (funcionarioId: string) => {
    setMembrosForm((prev) =>
      prev.map((m) => (m.funcionarioId === funcionarioId ? { ...m, status: 'remover' } : m))
    );
  };

  const adicionarMembroEquipeTarefa = async (idTarefa: string, idFuncionario: string) => {
    const payloads = [
      {
        tarefaDTO: { id: idTarefa },
        funcionarioDTO: { id: idFuncionario },
        status: formData.status,
      },
      {
        tarefaDTO: { id: idTarefa },
        funcionarioDTO: { id: idFuncionario },
      },
      {
        tarefaEtapaDTO: { id: idTarefa },
        funcionarioDTO: { id: idFuncionario },
        status: formData.status,
      },
      {
        tarefaEtapaDTO: { id: idTarefa },
        funcionarioDTO: { id: idFuncionario },
      },
    ];

    let ultimoErro: any = null;

    for (const payload of payloads) {
      try {
        await authApi.post("/membro-equipe-tarefa", payload);
        return true;
      } catch (error: any) {
        if (error?.response?.status === 409) {
          return true;
        }
        ultimoErro = error;
      }
    }

    throw ultimoErro;
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

      const promessasEquipe = membrosForm.map(async (m) => {
        if (m.status === 'novo') {
          await adicionarMembroEquipeTarefa(formData.id, m.funcionarioId);
          return;
        }

        if (m.status === 'remover' && m.vinculoId) {
          return authApi.delete(`/membro-equipe-tarefa/${m.vinculoId}`);
        }

        return Promise.resolve();
      });

      await Promise.all(promessasEquipe);

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
    } catch (error: any) {
      console.error('Erro ao editar tarefa:', error);
      const erroBruto =
        error?.response?.data && typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data)
          : undefined;
      const mensagemErroApi =
        (typeof error?.response?.data === 'string' ? error.response.data : undefined) ||
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.response?.data?.error ||
        erroBruto ||
        'Erro ao editar tarefa. Tente novamente.';
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: mensagemErroApi,
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
  const membrosVisiveis = membrosForm.filter((m) => m.status !== 'remover');

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

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">
                  Adicionar a Equipe
                </label>
                <select
                  name="responsavelId"
                  value=""
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  <option value="" disabled>Selecione um membro...</option>
                  {funcionarios?.map((f) => (
                    <option key={f.id} value={f.id}>{f.nomeCompleto}</option>
                  ))}
                </select>
              </div>

              {membrosVisiveis.length > 0 && (
                <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                  <label className="block text-muted font-medium text-xs mb-3 uppercase">Membros Vinculados</label>
                  <div className="flex flex-wrap gap-2">
                    {membrosVisiveis.map((membro) => (
                      <div
                        key={membro.funcionarioId}
                        className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-sm transition-all border border-blue-200"
                      >
                        {membro.nome}
                        <button
                          type="button"
                          onClick={() => removeResponsavel(membro.funcionarioId)}
                          className="font-bold text-lg hover:text-red-600 hover:scale-110 cursor-pointer ml-1 leading-none"
                          title="Remover membro"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
