import React, { useState } from "react";
import type { Demanda } from "../../../Hooks/useDemandas";
import { converterParaFormatoDateTimeLocal, formatarDisplayPrioridade, formatarDisplayStatusDemanda, PrioridadeDemanda, StatusDemanda } from "../../../types/TiposDemandas";
import { useClientesParaFiltro } from "../../../Hooks/useClientesParaFiltro";

type DemandaEditModalProps = {
  demanda: Demanda;
  onClose: () => void;
  onUpdate: (demandaEditada: Demanda) => void;
  onDeleteModal: (demandaExcluir: Demanda) => void;
};

const DemandaEditModal: React.FC<DemandaEditModalProps> = ({ demanda, onClose, onUpdate, onDeleteModal }) => {
  const [formData, setFormData] = useState(
    {
      ...demanda,
      inicioPrazo: converterParaFormatoDateTimeLocal(demanda.inicioPrazo),
      conclusaoPrazo: converterParaFormatoDateTimeLocal(demanda.conclusaoPrazo)
    }
  );

  const { clientesParaFiltro, loading: loadingClientes } = useClientesParaFiltro();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;

    // Se o usuário selecionar a opção "Nenhum", desassocia o cliente
    if (!clienteId) {
      setFormData({ ...formData, clienteDto: undefined });
      return;
    } else {
      // Esta linha pega o objeto inteiro
      const clienteSelecionado = clientesParaFiltro.find(c => c.id === clienteId);

      if (clienteSelecionado) {
        // Isso vai salvar { id, nome, tipoCliente } no estado.
        setFormData({ ...formData, clienteDto: clienteSelecionado });
      }

    }

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    onUpdate(formData);
    onClose();
  };

  const handleDelete = () => {
    onDeleteModal(demanda)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Editar Demanda</h3>
          <button type="button" onClick={handleDelete}
            className="px-4 py-2 bg-red-200 text-red-700 border border-red-700 rounded-md text-sm hover:bg-red-300">
            Excluir
          </button>
        </div>

        <hr className="border-t border-gray-200 my-4" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-lg font-medium">Título:</label>
            <input 
              type="text" 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Descrição:</label>
            <textarea 
              id="descricao" 
              name="descricao" 
              value={formData.descricao ?? ""} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Cliente:</label>
            <select
              name="clienteDto"
              // O valor do select é o ID do cliente que está no formData
              value={formData.clienteDto?.id || ''}
              onChange={handleClienteChange} // Use o handler específico aqui!
              disabled={loadingClientes} // Desabilita enquanto carrega
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            >
              <option value="">Nenhum</option> {/* Opção para desassociar */}
              {clientesParaFiltro.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Prioridade:</label>
            <select 
              name="prioridadeDemanda" 
              value={formData.prioridadeDemanda} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            >
              {PrioridadeDemanda.map((prioridade) => (
                <option key={prioridade} value={prioridade}>{formatarDisplayPrioridade(prioridade)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Status:</label>
            <select 
              name="statusDemanda" 
              value={formData.statusDemanda} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            >
              {StatusDemanda.map((estado) => (
                <option key={estado} value={estado}>{formatarDisplayStatusDemanda(estado)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-lg font-medium">Início do Prazo:</label>
              <input
                type="datetime-local"
                name="inicioPrazo"
                value={formData.inicioPrazo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-medium">Conclusão do Prazo:</label>
              <input
                type="datetime-local"
                name="conclusaoPrazo"
                value={formData.conclusaoPrazo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="submit"
              className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
              Salvar Alterações
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemandaEditModal;


