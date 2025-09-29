import React from 'react';
import { useEquipe } from '../../hooks/useEquipe';

type EquipeDaDemandaItemProps = {
  idDemanda: string;
  gatilhoAtualizacao: number;
};

const EquipeDaDemandaItem: React.FC<EquipeDaDemandaItemProps> = ({ idDemanda, gatilhoAtualizacao }) => {
  const { membrosEquipe, loading, paginaAtual, setPaginaAtual, totalPaginas } = useEquipe(idDemanda, gatilhoAtualizacao);

  // Mostra o carregamento apenas se for a primeira busca e não houver membros ainda
  if (loading && paginaAtual === 0 && membrosEquipe.length === 0) {
    return <p className="text-sm text-gray-500 mt-2">Carregando equipe...</p>;
  }

  return (
    <div className="mt-3"> {/* Margem para separar da linha de detalhes da demanda */}
      <span className="text-sm font-semibold text-gray-700">Equipe:</span>
      {membrosEquipe.length === 0 && !loading ? (
        <p className="text-xs text-gray-500 ml-1">Nenhum membro atribuído a esta demanda.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mt-1">
            {membrosEquipe.map((membro) => (
              <span
                key={membro.id}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-800 border border-gray-300 rounded-md shadow-sm"
                title={membro.funcionarioDTO.nomeCompleto} // Adiciona tooltip para nomes longos
              >
                {membro.funcionarioDTO.nomeCompleto}
              </span>
            ))}
          </div>
          {totalPaginas > 1 && (
            <div className="flex items-center justify-start gap-2 mt-3">
              <button
                onClick={() => setPaginaAtual(paginaAtual - 1)}
                disabled={paginaAtual === 0 || loading}
                className="px-2 py-0.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-600">
                Página {paginaAtual + 1} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual(paginaAtual + 1)}
                disabled={paginaAtual + 1 >= totalPaginas || loading}
                className="px-2 py-0.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
          {/* Indicador de carregamento para trocas de página */}
          {loading && (paginaAtual > 0 || membrosEquipe.length > 0) && <p className="text-xs text-gray-500 mt-1">Atualizando equipe...</p>}
        </>
      )}
    </div>
  );
};

export default EquipeDaDemandaItem;
