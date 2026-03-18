import type React from "react";
import { useState } from "react";
import { type StatusDemandaTipo } from "../../../types/TiposDemandas";
import DemandasStatusList from "./DemandasStatusList";
import type { Demanda } from "../../../Hooks/useDemandas";

interface DemandasStatusNavigatorProps {
  onEditDemanda: (demanda: Demanda) => void;
  onViewDemandaDetails: (demanda: Demanda) => void;
  filtro: string,
  tipoFiltro: 'funcionario' | 'cliente',
  updateSignal: { timestamp: number; statuses: StatusDemandaTipo[] };
  equipeUpdateSignal: {timestamp: number, demandaId: string};
}

const DemandaStatusNavigator: React.FC<DemandasStatusNavigatorProps> = ({onEditDemanda, onViewDemandaDetails, updateSignal, equipeUpdateSignal, filtro, tipoFiltro }) => {
  const [ abaAtiva, setAbaAtiva ] = useState<StatusDemandaTipo>("RequerindoEquipe");

  return (
    <div className="w-full max-w-screen-xl mx-auto p-6">
      
      {/* Menu das Abas */}
      <div className="flex gap-4 border-b border-gray-300 mb-6">
        <div>
          <button
            onClick={() => setAbaAtiva("RequerindoEquipe")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              abaAtiva === "RequerindoEquipe" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Aguardando Equipe
          </button>
          <button
            onClick={() => setAbaAtiva("EmAndamento")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              abaAtiva === "EmAndamento" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setAbaAtiva("Atrasada")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              abaAtiva === "Atrasada" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Atrasada
          </button>
          <button
            onClick={() => setAbaAtiva("Cancelada")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              abaAtiva === "Cancelada" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Cancelada
          </button>
          <button
            onClick={() => setAbaAtiva("Finalizada")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              abaAtiva === "Finalizada" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Finalizada
          </button>
        </div>
      </div>

      {/* Conteúdo das abas - Expansão do tamanho */}

      {abaAtiva && 
      <DemandasStatusList 
        statusTipo={abaAtiva}
        onEditarDemanda={onEditDemanda}
        onVisualizarDetalhesDemanda={onViewDemandaDetails}
        filtro={filtro}
        tipoFiltro={tipoFiltro}
        updateSignal={updateSignal}
        equipeUpdateSignal={equipeUpdateSignal}
      />}

    </div>
  )
}

export default DemandaStatusNavigator;