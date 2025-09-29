import React, { useState } from "react";
import { useTarefas } from "../../hooks/useTarefas";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda, PrioridadeDemanda, StatusDemanda } from "../../types/TiposDemandas";

type AdicionarTarefaModalProps = {
  idEtapa: string;
  onClose: () => void;
  onTarefaAdicionada: () => void;
};

const AdicionarTarefaModal: React.FC<AdicionarTarefaModalProps> = ({ idEtapa, onClose, onTarefaAdicionada }) => {
  const { cadastrarTarefa } = useTarefas(idEtapa);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: PrioridadeDemanda[1],
    status: StatusDemanda[2],
    inicioPrazo: "",
    conclusaoPrazo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatarDataParaAPI = (dataLocal: string): string | null => {
    if (!dataLocal) {
      return null;
    }
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
      await cadastrarTarefa({
        etapaDemandaDTO: { id: idEtapa },
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: formData.status,
        inicioPrazo: formatarDataParaAPI(formData.inicioPrazo),
        conclusaoPrazo: formatarDataParaAPI(formData.conclusaoPrazo),
      });

      onTarefaAdicionada();
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa:", error);
      // Adicione aqui lógica de tratamento de erro
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white p-8 rounded-lg border border-gray-300 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-4">Adicionar Nova Tarefa</h3>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M15.78 14.36a1 1 0 01-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 11-1.42-1.42l2.83-2.82-2.83-2.83a1 1 0 111.42-1.42l2.82 2.83 2.83-2.83a1 1 0 111.42 1.42l-2.83 2.82 2.83 2.83z" clipRule="evenodd" />
          </svg>
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-lg font-medium text-gray-700">Título:</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-lg font-medium text-gray-700">Descrição:</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label htmlFor="prioridade" className="block text-lg font-medium text-gray-700">Prioridade:</label>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            >
              {PrioridadeDemanda.map((prioridade) => (
                <option key={prioridade} value={prioridade}>{formatarDisplayPrioridade(prioridade)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-lg font-medium text-gray-700">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            >
              {StatusDemanda.map((status) => (
                <option key={status} value={status}>{formatarDisplayStatusDemanda(status)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="inicioPrazo" className="block text-lg font-medium text-gray-700">Início do Prazo:</label>
            <input
              type="datetime-local"
              id="inicioPrazo"
              name="inicioPrazo"
              value={formData.inicioPrazo}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label htmlFor="conclusaoPrazo" className="block text-lg font-medium text-gray-700">Conclusão do Prazo:</label>
            <input
              type="datetime-local"
              id="conclusaoPrazo"
              name="conclusaoPrazo"
              value={formData.conclusaoPrazo}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800"
            >
              Adicionar Tarefa
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarTarefaModal;