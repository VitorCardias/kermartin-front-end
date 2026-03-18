import React, { useState } from 'react';
import Titulo from '../../Titulo';
import AlertModal from '../AlertModal';
import { useDemandas } from '../../../Hooks/useDemandas';
import { useClientes } from '../../../Hooks/useClientes';
import { PrioridadeDemanda } from '../../../types/TiposDemandas';

type CadastroDemandaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const CadastroDemanda: React.FC<CadastroDemandaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cadastrarDemanda } = useDemandas();
  const { clientes } = useClientes();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    clienteDto: undefined as any,
    prioridadeDemanda: 'Media' as const,
    statusDemanda: 'RequerindoEquipe' as const,
    inicioPrazo: '',
    conclusaoPrazo: '',
    porcentagemConclusao: 0,
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'aviso' as 'aviso' | 'erro' | 'sucesso',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'porcentagemConclusao') {
      setFormData({
        ...formData,
        [name]: Math.min(100, Math.max(0, Number(value)))
      });
    } else if (name === 'clienteId') {
      // Encontrar o cliente completo no array de clientes
      const clienteSelecionado = clientes?.find(c => c.id === value);
      if (clienteSelecionado) {
        setFormData({
          ...formData,
          clienteDto: clienteSelecionado
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
      // Converter datetime-local para formato DD-MM-YYYY HH:mm:ss
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

      const demandaPayload = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        clienteDto: formData.clienteDto,
        prioridadeDemanda: formData.prioridadeDemanda,
        statusDemanda: formData.statusDemanda,
        inicioPrazo: formatarDataParaAPI(formData.inicioPrazo),
        conclusaoPrazo: formatarDataParaAPI(formData.conclusaoPrazo),
        porcentagemConclusao: formData.porcentagemConclusao,
      };

      console.log('Payload sendo enviado:', demandaPayload);

      const resultado = await cadastrarDemanda(demandaPayload);

      if (resultado) {
        setAlert({
          isOpen: true,
          titulo: 'Sucesso',
          mensagem: 'Demanda cadastrada com sucesso!',
          tipo: 'sucesso',
        });
        setFormData({
          titulo: '',
          descricao: '',
          clienteDto: undefined,
          prioridadeDemanda: 'Media',
          statusDemanda: 'RequerindoEquipe',
          inicioPrazo: '',
          conclusaoPrazo: '',
          porcentagemConclusao: 0,
        });
        onSuccess?.();
        setTimeout(() => onClose(), 1500);
      } else {
        setAlert({
          isOpen: true,
          titulo: 'Erro',
          mensagem: 'Erro ao cadastrar demanda. Tente novamente.',
          tipo: 'erro',
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar demanda:', error);
      setAlert({
        isOpen: true,
        titulo: 'Erro',
        mensagem: 'Erro ao cadastrar demanda. Tente novamente.',
        tipo: 'erro',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className='w-full bg-light border-b-3 border-default sticky top-0 z-10'>
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Cadastro de Demanda</Titulo>
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
              placeholder="Digite o título da demanda"
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
              placeholder="Digite a descrição da demanda"
              rows={4}
            />
          </div>

          {/* Cliente e Prioridade em linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cliente */}
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Cliente *</label>
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

            {/* Prioridade */}
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Prioridade *</label>
              <select
                name="prioridadeDemanda"
                value={formData.prioridadeDemanda}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                {PrioridadeDemanda.map((prioridade) => (
                  <option key={prioridade} value={prioridade}>
                    {prioridade === 'Media' ? 'Média' : prioridade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datas em linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data de Início */}
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

            {/* Data de Conclusão */}
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
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
        mostrarBotaoCancelar={false}
      />
    </div>
  );
};

export default CadastroDemanda;