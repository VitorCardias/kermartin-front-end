import React, { useState } from "react";
import type { Demanda } from "../../hooks/useDemandas";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../types/TiposDemandas";
import EquipeDemanda from "./EquipeDemanda";
import EtapasDemanda from "../etapa-demanda/EtapasDemanda";
import RelatoriosDemanda from "../relatorios/RelatoriosDemanda";

type DemandaModalProps = {
  demanda: Demanda;
  onClose: () => void;
  onEquipeAlterada: () => void;
};



const DemandaModal: React.FC<DemandaModalProps> = ({ demanda, onClose, onEquipeAlterada }) => {
  const [abaAtiva, setAbaAtiva] = useState("detalhes");

  //console.log(demanda);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg border border-gray-300 shadow-2xl max-h-screen overflow-y-auto h-auto">
        
        {/* Titulo do Modal */}
        <h3 className="text-3xl font-semibold mb-6">Detalhes da Demanda</h3>
        
        {/* Conteúdo Principal do Modal */}
        <div className="flex">
          
          {/* Navegador de Abas lateral */}
          <div className="w-56 flex flex-col space-y-3 border-r border-gray-300 pr-6">
            {["detalhes", "equipe", "etapas", "relatorio"].map((aba) => (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`px-6 py-3 text-left text-lg font-medium transition ${
                  abaAtiva === aba ? "text-black border-b-2 border-black" : "text-gray-600 hover:text-black"
                }`}
              >
                {aba.charAt(0).toUpperCase() + aba.slice(1)}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          <div className="flex-1 pl-6">
            {abaAtiva === "detalhes" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-xl font-semibold text-gray-900 mb-1">Título:</p>
                  <p className="text-lg text-gray-700">{demanda.titulo}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-xl font-semibold text-gray-900 mb-1">Descrição:</p>
                  <p className="text-lg text-gray-700 whitespace-pre-line">{demanda.descricao ?? "Sem descrição"}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-xl font-semibold text-gray-900 mb-1">Cliente:</p>
                  <p className="text-lg text-gray-700 whitespace-pre-line">{demanda.clienteDto?.nome ?? "Nenhum cliente associado a esta demanda."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="pb-2">
                      <p className="text-lg font-medium text-gray-900">Prioridade:</p>
                      <p className="text-lg text-gray-700">{formatarDisplayPrioridade(demanda.prioridadeDemanda)}</p>
                    </div>
                    <div className="pb-2">
                      <p className="text-lg font-medium text-gray-900">Início do Prazo:</p>
                      <p className="text-lg text-gray-700">{demanda.inicioPrazo ?? "Não definido"}</p>
                    </div>
                  </div>
                  <div>
                    <div className="pb-2">
                      <p className="text-lg font-medium text-gray-900">Status:</p>
                      <p className="text-lg text-gray-700">{formatarDisplayStatusDemanda(demanda.statusDemanda)}</p>
                    </div>
                    <div className="pb-2">
                      <p className="text-lg font-medium text-gray-900">Conclusão do Prazo:</p>
                      <p className="text-lg text-gray-700">{demanda.conclusaoPrazo ?? "Não definido"}</p>
                    </div>
                  </div>
                </div>

                {/*
                <div className="border-t pt-3">
                  <p className="text-lg font-medium text-gray-900">Porcentagem de Conclusão:</p>
                  <p className="text-lg text-gray-700">{demanda.porcentagemConclusao}%</p>
                </div>
                */}

              </div> 
            )}

            {abaAtiva === "equipe" && (
              <EquipeDemanda 
                idDemanda={demanda.id}
                onEquipeAlteradaNaListaPrincipal={onEquipeAlterada}
              />
            )}
            
            {abaAtiva === "etapas" && <EtapasDemanda idDemanda={demanda.id} />}

            {abaAtiva === "relatorio" && (
              <RelatoriosDemanda demanda={demanda} />
            )}
          </div>

        </div>
        
        {/* Botão para fechar modal */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-black text-white rounded-md transition hover:bg-gray-800"> Fechar 
        </button>

      </div>
    </div>
  );
};

export default DemandaModal;
