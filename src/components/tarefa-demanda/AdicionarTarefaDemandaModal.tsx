import React, { useState } from "react";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda, PrioridadeDemanda, StatusDemanda } from "../../types/TiposDemandas";
import { useTarefasDemanda } from "../../hooks/useTarefasDemandas";
import { useEtapas } from "../../hooks/useEtapas";

type AdicionarTarefaDemandaModalProps = {
  idDemanda: string;
  onClose: () => void;
  onTarefaAdicionada: () => void;
};

const AdicionarTarefaDemandaModal: React.FC<AdicionarTarefaDemandaModalProps> = ({ idDemanda, onClose, onTarefaAdicionada }) => {
  const { cadastrarTarefaAvulsa } = useTarefasDemanda(idDemanda);
  const { etapas } = useEtapas(idDemanda);
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: PrioridadeDemanda[1],
    status: StatusDemanda[2],
    inicioPrazo: "",
    conclusaoPrazo: "",
    etapaId: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatarDataParaAPI = (dataLocal: string): string | null => {
    if (!dataLocal) return null;
    const data = new Date(dataLocal);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = '00';

    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await cadastrarTarefaAvulsa({
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: formData.status,
        inicioPrazo: formatarDataParaAPI(formData.inicioPrazo),
        conclusaoPrazo: formatarDataParaAPI(formData.conclusaoPrazo),
        etapaDemandaDTO: formData.etapaId ? { id: formData.etapaId } : null,
      });

      onTarefaAdicionada();
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa: ", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white p-8 rounded-lg border border-gray-300 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-4">Nova Tarefa</h3>
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M15.78 14.36a1 1 0 01-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 11-1.42-1.42l2.83-2.82-2.83-2.83a1 1 0 111.42-1.42l2.82 2.83 2.83-2.83a1 1 0 111.42 1.42l-2.83 2.82 2.83 2.83z" clipRule="evenodd" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">Título:</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Descrição:</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Prioridade:</label>
            <select name="prioridade" value={formData.prioridade} onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black">
              {PrioridadeDemanda.map((prioridade) => (
                <option key={prioridade} value={prioridade}>{formatarDisplayPrioridade(prioridade)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Status:</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black">
              {StatusDemanda.map((status) => (
                <option key={status} value={status}>{formatarDisplayStatusDemanda(status)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Vincular a uma Etapa (Opcional):</label>
            <select 
              name="etapaId" 
              value={formData.etapaId} 
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            >
              <option value="">-- Tarefa Geral da Demanda (Sem Etapa) --</option>
              {etapas.map((etapa) => (
                <option key={etapa.id} value={etapa.id}>{etapa.titulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Início do Prazo:</label>
            <input type="datetime-local" name="inicioPrazo" value={formData.inicioPrazo} onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Conclusão do Prazo:</label>
            <input type="datetime-local" name="conclusaoPrazo" value={formData.conclusaoPrazo} onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
          </div>
          <div className="flex justify-end gap-4">
            <button type="submit" className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
              Salvar
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarTarefaDemandaModal;