import React, { useState } from "react";
import EditarTarefaModal from "./EditarTarefaModal";
import AdicionarTarefaModal from "./AdicionarTarefaModal"; // Importe o novo modal
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../types/TiposDemandas";
import { useTarefasEtapas } from "../../hooks/useTarefasEtapas";

type TarefaListProps = {
  idEtapa: string;
};

const TarefaList: React.FC<TarefaListProps> = ({ idEtapa }) => {
  const { tarefas, loading, paginaAtual, setPaginaAtual, totalPaginas, buscarTarefas, deletarTarefa} = useTarefasEtapas(idEtapa); // Agora com cadastrarTarefa
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<null | typeof tarefas[0]>(null);
  const [modalAdicionarTarefaAberto, setModalAdicionarTarefaAberto] = useState(false);

  const handleTarefaAdicionada = async () => {
    setModalAdicionarTarefaAberto(false);
    await buscarTarefas(); // Recarrega as tarefas após adicionar
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-900 p-6">
      
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-2xl font-semibold">Lista de Tarefas da Etapa</h4>
        <button
          onClick={() => setModalAdicionarTarefaAberto(true)}
          className="mb-6 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800" // Estilo semelhante ao botão de adicionar etapa
        >
          Adicionar Tarefa
        </button>
      </div>

      {loading ? (
        <p className="text-lg text-gray-600">Carregando tarefas...</p>
      ) : (
        <ul className="space-y-4">
          {tarefas.map((tarefa) => (
            <li
              key={tarefa.id}
              onClick={() => { setTarefaSelecionada(tarefa); setModalAberto(true); }}
              className="p-4 border border-gray-300 rounded-md cursor-pointer transition hover:bg-gray-100"
            >
              <p className="text-lg font-medium">{tarefa.titulo}</p>
              <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
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

      {modalAberto && tarefaSelecionada && (
        <EditarTarefaModal
          tarefa={tarefaSelecionada}
          onClose={() => setModalAberto(false)}
          onAtualizado={buscarTarefas}
          funcDeletar={deletarTarefa}
        />
      )}

      {/* Modal de Adicionar Tarefa */}
      {modalAdicionarTarefaAberto && (
        <AdicionarTarefaModal
          idEtapa={idEtapa}
          onClose={() => setModalAdicionarTarefaAberto(false)}
          onTarefaAdicionada={handleTarefaAdicionada} // Usa a função local para lidar com o fechamento e atualização
        />
      )}
    </div>
  );
};

export default TarefaList;