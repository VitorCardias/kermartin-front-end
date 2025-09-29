import React, { useState } from "react";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda, obterDataFormatoCorreto, PrioridadeDemanda, StatusDemanda } from "../../types/TiposDemandas";
import { usePerfil } from "../../hooks/usePerfil";
import { authApi } from "../../api/AuthService";


type AdicionarEtapaModalProps = {
  idDemanda: string;
  onClose: () => void;
  onAdicionado: () => void;
};

const AdicionarEtapaModal: React.FC<AdicionarEtapaModalProps> = ({ idDemanda, onClose, onAdicionado }) => {
  const perfil = usePerfil();
  const [formData, setFormData] = useState({
    demandaDTO: { id: idDemanda },
    titulo: "",
    prioridade: PrioridadeDemanda[1], // "Media"
    status: StatusDemanda[2], // "RequerindoEquipe"
    porcentagemConclusao: 0,
    criador: { id: perfil?.id ?? "" },
    descricao: "",
    inicioPrazo: null,
    conclusaoPrazo: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const adicionarEtapa = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Impede o comportamento padrão de submit do botão
    
    try {
      await authApi.post("/etapa-demanda", {
        ...formData,
        demandaDTO: { id: idDemanda },
        criador: { id: perfil?.id ?? "" },
        inicioPrazo: obterDataFormatoCorreto(formData.inicioPrazo),
        conclusaoPrazo: obterDataFormatoCorreto(formData.conclusaoPrazo),
      });

      onAdicionado();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar etapa:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-6 rounded-md border border-gray-300 shadow-2xl max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6">Adicionar Nova Etapa</h3>
        
        <form className="space-y-4">
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
              onClick={adicionarEtapa}
              className="px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800"
            >
              Adicionar Etapa
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

export default AdicionarEtapaModal;
