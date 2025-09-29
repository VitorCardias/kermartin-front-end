import React from 'react';
import type { Demanda } from '../../hooks/useDemandas';
import { formatarDisplayPrioridade } from '../../types/TiposDemandas';
import EquipeDaDemandaItem from './EquipeDaDemandaItem';

interface DemandaCardProps {
  demanda: Demanda;
  onAbrirDetalhes: (demanda: Demanda) => void;
  onAbrirEdicao: (demanda: Demanda) => void;
  equipeUpdateSignal: {timestamp: number, demandaId: string};
}

const DemandaCard: React.FC<DemandaCardProps> = ({ demanda, onAbrirDetalhes, onAbrirEdicao, equipeUpdateSignal }) => {
  
  // Lógica para determinar o valor do gatilho.
  // Se o ID da demanda no sinal for o mesmo que o ID desta demanda,
  // usamos o timestamp como um valor único para o gatilho.
  // Caso contrário, usamos um valor padrão (0).
  const gatilho = equipeUpdateSignal.demandaId === demanda.id 
    ? equipeUpdateSignal.timestamp 
    : 0;
  
  return (
    <div className="p-3 mb-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-lg transition-shadow duration-150 ease-in-out cursor-default">
      <div className="flex justify-between items-start mb-2">
        <h4
          className="text-base font-semibold text-gray-800 hover:text-blue-600 hover:underline cursor-pointer flex-grow mr-2"
          onClick={() => onAbrirDetalhes(demanda)}
          title={demanda.titulo} // Adiciona tooltip para títulos longos
        >
          {demanda.titulo.length > 50 ? `${demanda.titulo.substring(0, 47)}...` : demanda.titulo} {/* Limita o tamanho do título exibido */}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Impede que o click no card seja acionado se o botão estiver sobre o texto do título
            onAbrirEdicao(demanda);
          }}
          className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          aria-label={`Editar demanda ${demanda.titulo}`}
        >
          Editar
        </button>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Prioridade:</span> {formatarDisplayPrioridade(demanda.prioridadeDemanda as any)}
        </p>
        <p>
          <span className="font-medium">Prazo Inicio: {demanda.inicioPrazo}</span> | <span className="font-medium">Prazo Conclusão: {demanda.conclusaoPrazo}</span>
        </p>
        <EquipeDaDemandaItem idDemanda={demanda.id} gatilhoAtualizacao={gatilho} />
      </div>
    </div>
  );
};

export default DemandaCard;