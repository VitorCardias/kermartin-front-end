import { useEffect } from "react";
import { useDemandsByStatus } from "../../hooks/useDemandasByStatusDemanda";
import { formatarDisplayStatusDemanda, type StatusDemandaTipo } from "../../types/TiposDemandas";
import DemandaCard from "./DemandaCard";
import type { Demanda } from "../../hooks/useDemandas";

type DemandasStatusListProps = {
  statusTipo: StatusDemandaTipo;
  onEditarDemanda: (demanda: Demanda) => void;
  onVisualizarDetalhesDemanda: (demanda: Demanda) => void;
  filtro: string;
  tipoFiltro: 'funcionario' | 'cliente';
  updateSignal: { timestamp: number; statuses: StatusDemandaTipo[] };
  equipeUpdateSignal: {timestamp: number, demandaId: string};
}

const DemandasStatusList: React.FC<DemandasStatusListProps> = ({ statusTipo, onEditarDemanda, onVisualizarDetalhesDemanda, updateSignal, equipeUpdateSignal, filtro, tipoFiltro}) => {
  const {
    demandas,
    loading,
    paginaAtual,
    totalPaginas,
    mudarPagina,
    hasDemandas,
    refetchDemandas
  } = useDemandsByStatus(statusTipo, filtro, tipoFiltro);

  useEffect(() => {
    console.log(filtro);
  }, [filtro])

  useEffect(() => {    
    if (updateSignal.statuses.includes(statusTipo)) {
      console.log(`Notificação direcionada recebida para a coluna: ${statusTipo}. Fazendo refetch...`);
      refetchDemandas();
    }
  }, [updateSignal, statusTipo, refetchDemandas]); // Dependências para ser explícito
  
  const tituloColuna = formatarDisplayStatusDemanda(statusTipo);

  return (
    <div className="flex flex-col w-full p-3 bg-gray-100 rounded-lg"> {/* Estilo base da coluna */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700 px-1">{tituloColuna} ({demandas.length})</h3>

      {loading && !hasDemandas ? (
        <p className="text-gray-500">Carregando demandas...</p>
      ) : !loading && !hasDemandas ? (
        <p className="text-gray-500">Nenhuma demanda neste status.</p>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto px-2">
          {demandas.map((demanda) => (
            <DemandaCard
              key={demanda.id}
              demanda={demanda}
              onAbrirDetalhes={onVisualizarDetalhesDemanda}
              onAbrirEdicao={onEditarDemanda}
              equipeUpdateSignal={equipeUpdateSignal}
            />
            // <p key={demanda.id}>{demanda.titulo}</p> // Placeholder
          ))}
        </div>
      )}

      {/* Paginação para a coluna */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
          <button
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 0 || loading}
            className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 text-sm"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Pág. {paginaAtual + 1} de {totalPaginas}
          </span>
          <button
            onClick={() => mudarPagina(paginaAtual + 1)}
            disabled={paginaAtual + 1 >= totalPaginas || loading}
            className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 text-sm"
          >
            Próxima
          </button>
        </div>
      )}

    </div>
  )

}

export default DemandasStatusList;
