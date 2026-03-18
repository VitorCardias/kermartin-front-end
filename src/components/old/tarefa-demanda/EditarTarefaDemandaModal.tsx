import React, { useState } from "react";
import { authApi } from "../../../api/AuthService";
import { converterParaFormatoDateTimeLocal, formatarDisplayPrioridade, formatarDisplayStatusDemanda, obterDataFormatoCorreto, PrioridadeDemanda, StatusDemanda } from "../../../types/TiposDemandas";
import DeletarTarefaModal from "../tarefa-etapa/DeletarTarefaModal";
import EquipeTarefaDemanda from "./EquipeTarefaDemanda";
import type { TarefaDemandaAPI } from "../../../Hooks/useTarefasDemandas";

type EditarTarefaDemandaModalProps = {
  tarefa: TarefaDemandaAPI; 
  onClose: () => void;
  onAtualizado: () => void;
  funcDeletar: (idTarefa: string) => void;
};

const EditarTarefaDemandaModal: React.FC<EditarTarefaDemandaModalProps> = ({ tarefa, onClose, onAtualizado, funcDeletar }) => {
  const [formData, setFormData] = useState({ 
    ...tarefa,
    inicioPrazo: converterParaFormatoDateTimeLocal(tarefa.inicioPrazo),
    conclusaoPrazo: converterParaFormatoDateTimeLocal(tarefa.conclusaoPrazo) 
  });
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);

  // Verificações de segurança para saber o tipo da tarefa
  const isTarefaEtapa = !!formData.etapaDemandaDTO;
  const isTarefaDemandaAvulsa = !!formData.demandaDTO && !formData.etapaDemandaDTO;

  // Renderiza um subtítulo amigável baseado no tipo
  const getSubtitulo = () => {
    if (isTarefaEtapa) return "Vinculada à Etapa";
    if (isTarefaDemandaAvulsa) return "Vinculada à Demanda (Avulsa)";
    return "Independente (Agenda)";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.put("/tarefa-etapa", {
        id: formData.id,
        // Usando o ?. (Optional Chaining) para evitar erros se for null
        etapaDemandaDTO: formData.etapaDemandaDTO?.id ? { id: formData.etapaDemandaDTO.id } : null,
        demandaDTO: formData.demandaDTO?.id ? { id: formData.demandaDTO.id } : null,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-3xl font-semibold">Editar Tarefa</h3>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2 inline-block">
              {getSubtitulo()}
            </span>
          </div>
          <button type="button" onClick={() => setModalDeletarAberto(true)}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-100 font-medium transition-colors">
            Excluir Tarefa
          </button>
        </div>

        <hr className="border-t border-gray-200 my-6" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... OS INPUTS DO FORMULÁRIO CONTINUAM EXATAMENTE IGUAIS ... */}
          <div className="flex flex-col">
            <label className="text-lg font-medium">Título:</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium">Descrição:</label>
            <textarea name="descricao" value={formData.descricao ?? ""} onChange={handleChange} rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-lg font-medium">Prioridade:</label>
              <select name="prioridade" value={formData.prioridade} onChange={handleChange} required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black">
                {PrioridadeDemanda.map((prioridade) => (
                  <option key={prioridade} value={prioridade}>{formatarDisplayPrioridade(prioridade)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-lg font-medium">Status:</label>
              <select name="status" value={formData.status} onChange={handleChange} required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black">
                {StatusDemanda.map((estado) => (
                  <option key={estado} value={estado}>{formatarDisplayStatusDemanda(estado)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-lg font-medium">Início do Prazo:</label>
              <input type="datetime-local" name="inicioPrazo" value={formData.inicioPrazo ?? ""} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
            </div>
            <div className="flex flex-col">
              <label className="text-lg font-medium">Conclusão do Prazo:</label>
              <input type="datetime-local" name="conclusaoPrazo" value={formData.conclusaoPrazo ?? ""} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black" />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="submit" className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800">
              Salvar Alterações
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>

        {/* Lida com a exibição da equipe de forma condicional e SEGURA */}
        <div className="mt-10 border-t border-gray-200 pt-8">
            <h4 className="text-xl font-semibold mb-4">Equipe da Tarefa</h4>
            
            {/* O componente agora é inteligente o suficiente para lidar com idDemanda e idEtapa null */}
            <EquipeTarefaDemanda
              idTarefa={formData.id} 
              idDemanda={formData.demandaDTO?.id} // Vai null se for independente
              idEtapa={formData.etapaDemandaDTO?.id} // Vai null se for independente
              statusTarefa={tarefa.status} 
            />
        </div>

        <div className="flex justify-center mt-8">
          <button onClick={onClose} className="px-6 py-3 w-48 bg-gray-800 text-white rounded-md transition hover:bg-gray-700">
            Fechar Painel
          </button>
        </div>

        {modalDeletarAberto && (
          <DeletarTarefaModal
            tarefa={tarefa}
            onClose={() => setModalDeletarAberto(false)}
            deletar={() => { funcDeletar(tarefa.id); onClose(); }}
          />
        )}
      </div>
    </div>
  );
};

export default EditarTarefaDemandaModal;