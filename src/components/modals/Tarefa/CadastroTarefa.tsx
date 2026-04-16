import React, { useState, useEffect } from 'react';
import Titulo from '../../Titulo';
import AlertModal from '../AlertModal';
import { useTarefa } from '../../../Hooks/useTarefa';
import { useEtapas } from '../../../Hooks/useEtapas';
import { useDemandas } from '../../../Hooks/useDemandas';
import {
  PrioridadeTarefa,
  StatusTarefaTipo,
  converterDataTimeLocalParaAPI,
} from '../../../types/TiposTarefas';

type CadastroTarefaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  demandaIdPadrao?: string;
  contexto: 'demanda' | 'etapa' | 'tarefas';
};

const CadastroTarefa: React.FC<CadastroTarefaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  demandaIdPadrao,
  contexto,
}) => {
  const { cadastrarTarefa } = useTarefa();
  const { etapas } = useEtapas(demandaIdPadrao || '');
  const { demandas } = useDemandas();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'Media' as const,
    status: 'Pendente' as const,
    inicioPrazo: '',
    conclusaoPrazo: '',
    demandaId: demandaIdPadrao || '',
    etapaId: '',
  });

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    tipo: 'aviso' | 'erro' | 'sucesso';
    acaoConfirmar?: () => void;
  }>({ isOpen: false, titulo: '', mensagem: '', tipo: 'aviso' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demandaIdPadrao) {
      setFormData((prev) => ({
        ...prev,
        demandaId: demandaIdPadrao,
      }));
    }
  }, [demandaIdPadrao]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): string | null => {
    if (!formData.titulo.trim()) {
      return 'Título da tarefa é obrigatório';
    }
    if (formData.titulo.trim().length < 3) {
      return 'Título deve ter no mínimo 3 caracteres';
    }
    if (contexto === 'tarefas' && !formData.demandaId) {
      return 'Demanda é obrigatória';
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
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        prioridade: formData.prioridade,
        status: formData.status,
        inicioPrazo: converterDataTimeLocalParaAPI(formData.inicioPrazo),
        conclusaoPrazo: converterDataTimeLocalParaAPI(formData.conclusaoPrazo),
        demandaDTO: formData.demandaId ? { id: formData.demandaId } : null,
        etapaDemandaDTO: formData.etapaId ? { id: formData.etapaId } : null,
      };

      await cadastrarTarefa(tarefaPayload);

      setAlert({
        isOpen: true,
        titulo: 'Sucesso',
        mensagem: 'Tarefa cadastrada com sucesso!',
        tipo: 'sucesso',
        acaoConfirmar: () => {
          setFormData({
            titulo: '',
            descricao: '',
            prioridade: 'Media',
            status: 'Pendente',
            inicioPrazo: '',
            conclusaoPrazo: '',
            demandaId: demandaIdPadrao || '',
            etapaId: '',
          });
          onSuccess?.();
          onClose();
        },
      });
    } catch (error) {
      console.error('Erro ao cadastrar tarefa:', error);
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: 'Erro ao cadastrar tarefa. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  };

  const demandaSelecionada = demandas.find(d => d.id === formData.demandaId);

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-full bg-light border-b-3 border-default sticky top-0 z-10">
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Cadastro de Tarefa</Titulo>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {/* Título */}
          <div>
            <label className="block text-primary font-medium text-sm mb-2">Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-primary font-medium text-sm mb-2">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Digite a descrição da tarefa"
              rows={4}
            />
          </div>

          {/* Demanda e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Demanda */}
            <div>
              <label className="block text-primary font-medium text-sm mb-2">
                Demanda {contexto === 'tarefas' ? '*' : ''}
              </label>
              {contexto !== 'tarefas' && demandaIdPadrao ? (
                <div className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm flex items-center">
                  <span className="text-gray-700 font-medium">
                    {demandaSelecionada?.titulo || 'Demanda padrão'}
                  </span>
                </div>
              ) : (
                <select
                  name="demandaId"
                  value={formData.demandaId}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required={contexto === 'tarefas'}
                >
                  <option value="">Selecione uma demanda</option>
                  {demandas.map((demanda) => (
                    <option key={demanda.id} value={demanda.id}>
                      {demanda.titulo}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Prioridade *</label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                {PrioridadeTarefa.map((p) => (
                  <option key={p} value={p}>
                    {p === 'Media' ? 'Média' : p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status e Etapa */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {StatusTarefaTipo.map((s) => (
                  <option key={s} value={s}>
                    {s === 'Finalizada' ? 'Finalizada' : s === 'EmAndamento' ? 'Em Andamento' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Etapa */}
            {etapas && etapas.length > 0 && (
              <div>
                <label className="block text-primary font-medium text-sm mb-2">Etapa</label>
                <select
                  name="etapaId"
                  value={formData.etapaId}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Selecione uma etapa</option>
                  {etapas.map((etapa) => (
                    <option key={etapa.id} value={etapa.id}>
                      {etapa.titulo}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Data de Início</label>
              <input
                type="datetime-local"
                name="inicioPrazo"
                value={formData.inicioPrazo}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-primary font-medium text-sm mb-2">Data de Conclusão</label>
              <input
                type="datetime-local"
                name="conclusaoPrazo"
                value={formData.conclusaoPrazo}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
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
              className="px-4 py-2 bg-primary text-white rounded-md hover:brightness-110 hover:translate-y-1 cursor-pointer disabled:opacity-50 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
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
          setAlert((prev) => ({ ...prev, isOpen: false }));
          if (alert.acaoConfirmar) {
            alert.acaoConfirmar();
          }
        }}
        mostrarBotaoCancelar={false}
      />
    </div>
  );
};

export default CadastroTarefa;