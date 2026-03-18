import React, { useState } from "react";
import EquipeTarefa from "./EquipeTarefa"; // Componente para exibir a equipe da tarefa
import { authApi } from "../../../api/AuthService";
import { converterParaFormatoDateTimeLocal, formatarDisplayPrioridade, formatarDisplayStatusDemanda, obterDataFormatoCorreto, PrioridadeDemanda, StatusDemanda } from "../../../types/TiposDemandas";
import DeletarTarefaModal from "./DeletarTarefaModal";

type EditarTarefaModalProps = {
  tarefa: {
    id: string;
    titulo: string;
    descricao: string | null;
    prioridade: string;
    status: string;
    porcentagemConclusao: number;
    inicioPrazo: string | null;
    conclusaoPrazo: string | null;
    etapaDemandaDTO: { id: string };
    criador: { id: string };
  };
  onClose: () => void;
  onAtualizado: () => void;
  funcDeletar: (idTarefa: string) => void;
};

const EditarTarefaModal: React.FC<EditarTarefaModalProps> = ({ tarefa, onClose, onAtualizado, funcDeletar }) => {
  const [formData, setFormData] = useState(
    { 
      ...tarefa,
      inicioPrazo: converterParaFormatoDateTimeLocal(tarefa.inicioPrazo),
      conclusaoPrazo: converterParaFormatoDateTimeLocal(tarefa.conclusaoPrazo) 
    }
  );
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.put("/tarefa-etapa", {
        id: formData.id,
        etapaDemandaDTO: { id: formData.etapaDemandaDTO.id },
        criador: { id: tarefa.criador.id },
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: formData.status,
        porcentagemConclusao: formData.porcentagemConclusao,
        inicioPrazo: obterDataFormatoCorreto(formData.inicioPrazo),
        conclusaoPrazo: obterDataFormatoCorreto(formData.conclusaoPrazo),
      });

      onAtualizado();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  const handleDeleteTarefa = async () => {
    //event.preventDefault(); // Impede o comportamento padrão de submit do botão
    
    try {
      console.log("tentando deletar tarefa camda 01");
      funcDeletar(tarefa.id);
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar etapa:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        
        {/* Cabeçalho Modal */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-semibold mb-6">Editar Tarefa</h3>
          <button type="button" onClick={() => setModalDeletarAberto(true)}
            className="px-4 py-2 bg-red-200 text-red-700 border border-red-700 rounded-md text-sm hover:bg-red-300">
            Excluir
          </button>
        </div>

        <hr className="border-t border-gray-200 my-4" />
        
        {/* Formulário Modal */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-lg font-medium">Prioridade:</label>
              <select
                name="prioridade"
                value={formData.prioridade}
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
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              >
                {StatusDemanda.map((estado) => (
                  <option key={estado} value={estado}>{formatarDisplayStatusDemanda(estado)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-lg font-medium">Início do Prazo:</label>
              <input
                type="datetime-local"
                name="inicioPrazo"
                value={formData.inicioPrazo ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-medium">Conclusão do Prazo:</label>
              <input
                type="datetime-local"
                name="conclusaoPrazo"
                value={formData.conclusaoPrazo ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800"
            >
              Salvar Alterações
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

        {/* Exibindo a equipe associada à tarefa abaixo do formulário */}
        <EquipeTarefa idTarefa={formData.id} idEtapa={formData.etapaDemandaDTO.id} statusTarefa={tarefa.status} />

        {/* Botão de fechamento no final */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 w-48 bg-red-500 text-white rounded-md transition hover:bg-red-600"
          >
            Fechar
          </button>
        </div>

        {/* Modal de exclusão de etapa */}
        {modalDeletarAberto && (
          <DeletarTarefaModal
            tarefa={tarefa}
            onClose={() => setModalDeletarAberto(false)}
            deletar={() => handleDeleteTarefa()}
          />
        )}

      </div>
    </div>

  );
};

export default EditarTarefaModal;
