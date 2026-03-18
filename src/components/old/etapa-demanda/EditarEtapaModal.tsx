import React, { useState } from "react";
import { authApi } from "../../../api/AuthService";
import { converterParaFormatoDateTimeLocal, formatarDisplayPrioridade, formatarDisplayStatusDemanda, obterDataFormatoCorreto, PrioridadeDemanda, StatusDemanda } from "../../../types/TiposDemandas";
import EquipeEtapa from "./EquipeEtapa";
import TarefaList from "../tarefa-etapa/TarefaList";
import { type EtapaDemanda } from "../../../Hooks/useEtapas";
import DeletarEtapaModal from "./DeletarEtapaModal";
// Importando TarefaList

type EditarEtapaModalProps = {
  etapa: EtapaDemanda
  idDemanda: string;
  onClose: () => void;
  onAtualizado: () => void;
  deletar: (idEtapaDemanda: string) => void;
};

const EditarEtapaModal: React.FC<EditarEtapaModalProps> = ({ etapa, idDemanda, onClose, onAtualizado, deletar }) => {
  const [formData, setFormData] = useState(
    { 
      ...etapa,
      inicioPrazo: converterParaFormatoDateTimeLocal(etapa.inicioPrazo),
      conclusaoPrazo: converterParaFormatoDateTimeLocal(etapa.conclusaoPrazo) 
    }
  );
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("editar");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.put("/etapa-demanda", {
        id: formData.id,
        demandaDTO: { id: idDemanda },
        criador: { id: etapa.criador.id },
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: formData.status,
        porcentagemConclusao: formData.porcentagemConclusao,
        inicioPrazo: obterDataFormatoCorreto(formData.inicioPrazo),
        conclusaoPrazo: obterDataFormatoCorreto(formData.conclusaoPrazo)
      });

      onAtualizado();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar etapa:", error);
    }
  };

  const handleDeleteEtapa = async () => {
    //event.preventDefault(); // Impede o comportamento padrão de submit do botão
    
    try {
      console.log("tentando deletar etapa camda 01");
      deletar(etapa.id);
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar etapa:", error);
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Editar Etapa</h3>
          <button type="button" onClick={() => setModalDeletarAberto(true)}
            className="px-4 py-2 bg-red-200 text-red-700 border border-red-700 rounded-md text-sm hover:bg-red-300">
            Excluir
          </button>
        </div>

        <hr className="border-t border-gray-200 my-4" />

        {/* Navegação de Abas */}
        <div className="flex border-b border-gray-300 mb-4">
          <button
            onClick={() => setAbaAtiva("editar")}
            className={`px-4 py-2 text-lg font-medium ${
              abaAtiva === "editar" ? "border-b-2 border-black" : "text-gray-600 hover:text-black"
            }`}
          >
            Editar Etapa
          </button>
          <button
            onClick={() => setAbaAtiva("tarefas")}
            className={`px-4 py-2 text-lg font-medium ${
              abaAtiva === "tarefas" ? "border-b-2 border-black" : "text-gray-600 hover:text-black"
            }`}
          >
            Gerenciar Tarefas
          </button>
        </div>

        {/* Conteúdo da Aba de Editar Etapa */}
        {abaAtiva === "editar" && (
          <div>
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

            {/*Seção Equipe*/}
            <EquipeEtapa idEtapa={formData.id} idDemanda={idDemanda} />
          </div>
        )}

        {/* Modal de exclusão de etapa */}
        {modalDeletarAberto && (
          <DeletarEtapaModal
            idDemanda={idDemanda}
            etapa={etapa}
            onClose={() => setModalDeletarAberto(false)}
            deletar={() => handleDeleteEtapa()}
          />
        )}

        {/* Conteúdo da Aba de Gerenciar Tarefas */}
        {abaAtiva === "tarefas" && (
          <div className="mt-6">
            <TarefaList idEtapa={etapa.id} />
          </div>
        )}

        {/* Botão de Fechamento (mantido fora das abas para ficar sempre visível) */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 w-48 bg-red-500 text-white rounded-md transition hover:bg-red-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarEtapaModal;