import React, { useState } from "react";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../types/TiposDemandas";
import { useTarefasDemanda, type TarefaDemandaAPI } from "../../hooks/useTarefasDemandas";
import EditarTarefaDemandaModal from "./EditarTarefaDemandaModal";
import AdicionarTarefaDemandaModal from "./AdicionarTarefaDemandaModal";


type TarefasDemandaProps = {
  idDemanda: string;
};

const TarefasDemanda: React.FC<TarefasDemandaProps> = ({ idDemanda }) => {
  // Usando o novo hook!
  const { tarefas, loading, paginaAtual, setPaginaAtual, totalPaginas, buscarTarefas, deletarTarefa } = useTarefasDemanda(idDemanda);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaDemandaAPI | null>(null);
  const [modalAdicionarTarefaAberto, setModalAdicionarTarefaAberto] = useState(false);
  
  // Estado para os Pills (todas, geral, etapas)
  const [filtro, setFiltro] = useState<"todas" | "geral" | "etapas">("todas");

  const handleTarefaAdicionadaOuEditada = async () => {
    setModalAdicionarTarefaAberto(false);
    setModalAberto(false);
    await buscarTarefas();
  };

  // Aplica o filtro selecionado nos Pills
  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtro === "geral") return !t.etapaDemandaDTO;
    if (filtro === "etapas") return !!t.etapaDemandaDTO;
    return true;
  });

  return (
    <div className="w-full text-gray-900 p-2">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-2xl font-semibold">Todas as Tarefas</h4>
        <button
          onClick={() => setModalAdicionarTarefaAberto(true)}
          className="px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
        >
          Nova Tarefa
        </button>
      </div>

      {/* Filtros em formato Pill */}
      <div className="flex space-x-3 mb-6">
        {(["todas", "geral", "etapas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1 text-sm font-medium rounded-full border transition ${
              filtro === f
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
            }`}
          >
            {f === "todas" ? "Todas as Tarefas" : f === "geral" ? "Gerais da Demanda" : "Vinculadas a Etapas"}
          </button>
        ))}
      </div>

      {/* Grid de Tarefas */}
      {loading ? (
        <p className="text-lg text-gray-600">Carregando tarefas...</p>
      ) : tarefasFiltradas.length === 0 ? (
        <p className="text-lg text-gray-500 italic">Nenhuma tarefa encontrada para este filtro.</p>
      ) : (
        <ul className="space-y-4">
          {tarefasFiltradas.map((tarefa) => (
            <li
              key={tarefa.id}
              onClick={() => { setTarefaSelecionada(tarefa); setModalAberto(true); }}
              className="p-4 border border-gray-300 rounded-md cursor-pointer transition hover:bg-gray-100 flex flex-col"
            >
              {/* Título e Badge */}
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-medium">{tarefa.titulo}</p>
                {/* O BADGE AQUI DECIDE A COR PELO TIPO DA TAREFA */}
                {tarefa.etapaDemandaDTO ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded truncate max-w-[200px]">
                      Etapa: {tarefa.etapaDemandaDTO.titulo}
                    </span>
                ) : (
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded">
                      Tarefa Geral
                    </span>
                )}
              </div>

              {/* Detalhes originais do seu layout */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <p><strong>Prioridade:</strong> {formatarDisplayPrioridade(tarefa.prioridade)}</p>
                <p><strong>Status:</strong> {formatarDisplayStatusDemanda(tarefa.status)}</p>
                <p><strong>Conclusão:</strong> {tarefa.porcentagemConclusao}%</p>
                <p><strong>Prazo:</strong> {tarefa.inicioPrazo ?? "Não definido"} até {tarefa.conclusaoPrazo ?? "Não definido"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Paginação */}
      {!loading && totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 0}
            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400"
          >
            Anterior
          </button>
          <span className="text-lg font-medium text-gray-700">
            Página {paginaAtual + 1} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual + 1 >= totalPaginas}
            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modais */}
      {modalAberto && tarefaSelecionada && (
        <EditarTarefaDemandaModal
          tarefa={tarefaSelecionada}
          onClose={() => setModalAberto(false)}
          onAtualizado={handleTarefaAdicionadaOuEditada}
          funcDeletar={deletarTarefa} 
        />
      )}

      {modalAdicionarTarefaAberto && (
        <AdicionarTarefaDemandaModal
          idDemanda={idDemanda} // Modifique seu modal para aceitar e enviar isso no payload!
          onClose={() => setModalAdicionarTarefaAberto(false)}
          onTarefaAdicionada={handleTarefaAdicionadaOuEditada} 
        />
      )}
    </div>
  );
};

export default TarefasDemanda;