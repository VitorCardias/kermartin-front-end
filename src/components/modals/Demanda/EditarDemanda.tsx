import React, { useState, useEffect } from 'react';
import Titulo from '../../Titulo';
import AlertModal from '../AlertModal';
import { useDemandas } from '../../../Hooks/useDemandas';
import { useClientes } from '../../../Hooks/useClientes';
import { useFuncionarios } from '../../../Hooks/useFuncionarios';
import { useEquipe } from '../../../Hooks/useEquipe';
import { authApi } from '../../../api/AuthService';
import { converterParaFormatoDateTimeLocal, PrioridadeDemanda } from '../../../types/TiposDemandas';

type EditarDemandaProps = {
  isOpen: boolean;
  onClose: () => void;
  demanda?: any;
  onSuccess?: (demandaAtualizada?: any, acao?: 'editar' | 'excluir') => void;
};

type MembroFila = {
  funcionarioId: string;
  nome: string;
  vinculoId?: string; 
  status: 'ativo' | 'novo' | 'remover'; 
};

const EditarDemanda: React.FC<EditarDemandaProps> = ({ isOpen, onClose, demanda, onSuccess }) => {
  const { editarDemanda, deletarDemanda } = useDemandas();
  const { clientes } = useClientes();
  const { funcionarios } = useFuncionarios();
  
  const { membrosEquipe } = useEquipe(demanda?.id || "");

  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    clienteDto: undefined as any,
    prioridadeDemanda: 'Media' as string,
    statusDemanda: 'RequerindoEquipe' as string,
    inicioPrazo: '',
    conclusaoPrazo: '',
    porcentagemConclusao: 0,
  });

  const [membrosForm, setMembrosForm] = useState<MembroFila[]>([]);

  // 1. Alteramos o estado do alerta para aceitar uma função "acaoConfirmar"
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    tipo: 'aviso' | 'erro' | 'sucesso';
    acaoConfirmar?: () => void;
  }>({ isOpen: false, titulo: '', mensagem: '', tipo: 'aviso' });

  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const obterDataAtualFormato = () => {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");
    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
  };

  useEffect(() => {
    if (isOpen && demanda) {
      const clienteCompleto = clientes?.find(c => c.id === demanda.clienteDto?.id);
      setFormData({
        id: demanda.id,
        titulo: demanda.titulo || '',
        descricao: demanda.descricao || '',
        clienteDto: clienteCompleto || demanda.clienteDto,
        prioridadeDemanda: demanda.prioridadeDemanda || 'Media',
        statusDemanda: demanda.statusDemanda || 'RequerindoEquipe',
        inicioPrazo: converterParaFormatoDateTimeLocal(demanda.inicioPrazo),
        conclusaoPrazo: converterParaFormatoDateTimeLocal(demanda.conclusaoPrazo),
        porcentagemConclusao: demanda.porcentagemConclusao || 0,
      });
    }
  }, [isOpen, demanda, clientes]);

  useEffect(() => {
    if (membrosEquipe && membrosEquipe.length > 0) {
      const equipeFormatada: MembroFila[] = membrosEquipe.map(m => ({
        vinculoId: m.id, 
        funcionarioId: m.funcionarioDTO.id, 
        nome: m.funcionarioDTO.nomeCompleto,
        status: 'ativo'
      }));
      setMembrosForm(equipeFormatada);
    } else {
      setMembrosForm([]);
    }
  }, [membrosEquipe]);

  useEffect(() => {
    setFormData(prev => {
      if (prev.statusDemanda === 'Finalizada' || prev.statusDemanda === 'Cancelada') {
        return prev;
      }

      const membrosAtivos = membrosForm.filter(m => m.status !== 'remover').length;
      const dataAtual = new Date();
      const estaAtrasado = prev.conclusaoPrazo ? dataAtual > new Date(prev.conclusaoPrazo) : false;

      let novoStatus = prev.statusDemanda;

      if (estaAtrasado) {
        novoStatus = 'Atrasada';
      } else {
        if (membrosAtivos > 0) {
          novoStatus = 'EmAndamento';
        } else {
          novoStatus = 'RequerindoEquipe';
        }
      }

      if (novoStatus !== prev.statusDemanda) {
        return { ...prev, statusDemanda: novoStatus };
      }

      return prev;
    });
  }, [membrosForm, formData.conclusaoPrazo]);

  if (!isOpen) return null;

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'RequerindoEquipe': return { bg: 'bg-status-wait', text: 'text-status-wait' };
      case 'EmAndamento': return { bg: 'bg-status-inprogress', text: 'text-status-inprogress' };
      case 'Finalizada': return { bg: 'bg-status-completed', text: 'text-status-completed' };
      case 'Atrasada': return { bg: 'bg-status-delayed', text: 'text-status-delayed' };
      case 'Cancelada': return { bg: 'bg-gray-400', text: 'text-gray-700' };
      default: return { bg: 'bg-status-wait', text: 'text-status-wait' };
    }
  };
  const { bg: statusBgColor, text: statusTextColor } = getStatusColors(formData.statusDemanda);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'clienteId') {
      const clienteSelecionado = clientes?.find(c => c.id === value);
      if (clienteSelecionado) setFormData({ ...formData, clienteDto: clienteSelecionado });
    } else if (name === 'responsavelId') {
      const func = funcionarios?.find(f => f.id === value);
      if (func) {
        setMembrosForm(prev => {
          const existe = prev.find(m => m.funcionarioId === func.id);
          if (existe) {
            if (existe.status === 'remover') {
              return prev.map(m => m.funcionarioId === func.id ? { ...m, status: m.vinculoId ? 'ativo' : 'novo' } : m);
            }
            return prev;
          }
          return [...prev, { funcionarioId: func.id, nome: func.nomeCompleto, status: 'novo' }];
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeResponsavel = (funcionarioId: string) => {
    setMembrosForm(prev => prev.map(m => {
      if (m.funcionarioId === funcionarioId) {
        return { ...m, status: 'remover' };
      }
      return m;
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.titulo.trim()) return 'Titulo da demanda e obrigatorio';
    if (formData.titulo.trim().length < 3) return 'Titulo deve ter no minimo 3 caracteres';
    if (!formData.clienteDto) return 'Cliente e obrigatorio';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setAlert({ isOpen: true, titulo: 'Erro', mensagem: validationError, tipo: 'erro' });
      return;
    }

    setLoading(true);
    try {
      const criadorSeguro =
        demanda?.criador?.id
          ? { id: demanda.criador.id }
          : demanda?.escritorioId
            ? { id: demanda.escritorioId }
            : demanda?.criador;

      const clienteSeguro =
        clientes?.find(c => c.id === formData.clienteDto?.id) || formData.clienteDto;
      
            const payloadEdicao = {
        ...formData,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao?.trim() ? formData.descricao.trim() : null,
        clienteDto: clienteSeguro,
        prioridadeDemanda: formData.prioridadeDemanda,
        statusDemanda: formData.statusDemanda,
        porcentagemConclusao: Number(formData.porcentagemConclusao || 0),
        inicioPrazo: formData.inicioPrazo || null,
        conclusaoPrazo: formData.conclusaoPrazo || null,
        criador: criadorSeguro,
      };

      const resultadoDemanda = await editarDemanda(payloadEdicao as any);

      if (resultadoDemanda) {
        const promessasEquipe = membrosForm.map(async (m) => {
          if (m.status === 'novo') {
            return authApi.post("/membro-equipe-demanda", {
              demandaDTO: { id: formData.id },
              funcionarioDTO: { id: m.funcionarioId },
              inicioParticipacao: obterDataAtualFormato()
            });
          } else if (m.status === 'remover' && m.vinculoId) {
            return authApi.delete(`/membro-equipe-demanda/${m.vinculoId}`);
          }
          return Promise.resolve();
        });

        await Promise.all(promessasEquipe);

        // 2. Removemos o setTimeout e passamos as funções de fechamento para acaoConfirmar
        setAlert({ 
          isOpen: true, 
          titulo: 'Sucesso', 
          mensagem: 'Demanda e equipe atualizadas!', 
          tipo: 'sucesso',
          acaoConfirmar: () => {
            onSuccess?.(resultadoDemanda, 'editar');
            onClose();
          }
        });
      } else {
        setAlert({ isOpen: true, titulo: 'Erro', mensagem: 'Erro ao atualizar a demanda.', tipo: 'erro' });
      }
    } catch (error: any) {
      const mensagemErroApi =
        (typeof error?.response?.data === 'string' ? error.response.data : undefined) ||
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.response?.data?.error ||
        'Ocorreu um erro na requisicao.';
      setAlert({ isOpen: true, titulo: 'Erro', mensagem: mensagemErroApi, tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const resultado = await deletarDemanda(formData.id);
      if (resultado) {
        // 3. Mesma coisa no delete: remove setTimeout e usa acaoConfirmar
        setAlert({ 
          isOpen: true, 
          titulo: 'Sucesso', 
          mensagem: 'Demanda deletada com sucesso!', 
          tipo: 'sucesso',
          acaoConfirmar: () => {
            onSuccess?.(formData, 'excluir');
            onClose();
          }
        });
      } else {
        setAlert({ isOpen: true, titulo: 'Erro', mensagem: 'Erro ao deletar demanda. Tente novamente.', tipo: 'erro' });
      }
    } catch (error) {
      console.error('Erro ao deletar demanda:', error);
      setAlert({ isOpen: true, titulo: 'Erro', mensagem: 'Erro ao deletar demanda. Tente novamente.', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  const membrosVisiveis = membrosForm.filter(m => m.status !== 'remover');

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className='w-full bg-light border-b-3 border-default sticky top-0 z-10 flex items-center justify-between'>
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Editar Demanda</Titulo>
          <button onClick={() => setDeleteConfirmOpen(true)} className="px-4 py-2 mr-6 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-50 text-sm font-medium cursor-pointer" disabled={loading}>
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4 p-8">
              
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Título da Demanda *</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Descrição Detalhada</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none" rows={5} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">Vincular a Cliente *</label>
                  <select name="clienteId" value={formData.clienteDto?.id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="">Selecione um cliente</option>
                    {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium text-xs mb-2 uppercase">Adicionar à Equipe</label>
                  <select name="responsavelId" value="" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer">
                    <option value="" disabled>Selecione um membro...</option>
                    {funcionarios?.map(f => <option key={f.id} value={f.id}>{f.nomeCompleto}</option>)}
                  </select>
                </div>
              </div>

              {membrosVisiveis.length > 0 && (
                <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                  <label className="block text-muted font-medium text-xs mb-3 uppercase">Membros Vinculados na Fila</label>
                  <div className="flex flex-wrap gap-2">
                    {membrosVisiveis.map((membro) => (
                      <div key={membro.funcionarioId} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-sm transition-all border border-blue-200">
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

            <div className="lg:w-72 space-y-4 p-8 bg-slate-50">
              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Status da Tarefa</label>
                <select name="statusDemanda" value={formData.statusDemanda} onChange={handleChange} className={`w-full px-3 py-2 border border-gray-300 rounded-md font-semibold text-sm ${statusTextColor} ${statusBgColor}`}>
                  <option value="RequerindoEquipe">Aguardando por Equipe</option>
                  <option value="EmAndamento">Em Andamento</option>
                  <option value="Finalizada">Finalizado</option>
                  <option value="Atrasada">Atrasada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Prioridade</label>
                <div className="flex gap-2 flex-wrap">
                  {PrioridadeDemanda.map(p => (
                    <button key={p} type="button" onClick={() => setFormData({ ...formData, prioridadeDemanda: p as any })} className={`px-4 py-2 rounded-md text-sm cursor-pointer ${formData.prioridadeDemanda === p ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                      {p === 'Media' ? 'Média' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Data de Início</label>
                <input type="datetime-local" name="inicioPrazo" value={formData.inicioPrazo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>

              <div>
                <label className="block text-muted font-medium text-xs mb-2 uppercase">Prazo de Entrega</label>
                <input type="datetime-local" name="conclusaoPrazo" value={formData.conclusaoPrazo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end p-6 border-t border-gray-300 items-center bg-gray-50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium cursor-pointer" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-md hover:brightness-110 cursor-pointer disabled:opacity-50 text-sm font-medium" disabled={loading}>
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
        onConfirm={() => {
          setAlert(prev => ({ ...prev, isOpen: false }));
          if (alert.acaoConfirmar) {
            alert.acaoConfirmar(); 
          }
        }} 
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

