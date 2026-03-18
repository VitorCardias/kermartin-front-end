import React, { useState } from "react";
import { useTarefasFuncionario, type TarefaComAtribuicao, type TarefaFuncionario } from "../../../Hooks/useTarefasFuncionario.ts";
import { usePerfil } from "../../../Hooks/usePerfil.ts";
import TarefaFuncionarioModal from "./TarefaFuncionarioModal.tsx";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../../types/TiposDemandas.ts";
import ConfirmacaoConcluirModal from "./ConfirmacaoConcluirTarefaModal.tsx";

const TarefasFuncionarioList: React.FC = () => {
  const perfil = usePerfil();
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaFuncionario | null>(null);
  const [tarefaParaConcluir, setTarefaParaConcluir] = useState<TarefaComAtribuicao | null>(null);
  const perfilId = perfil?.id || "";
  const { tarefas, loading, paginaAtual, setPaginaAtual, totalPaginas, concluirTarefa } = useTarefasFuncionario(perfilId);
  
  // Se não há perfil, mostramos a mensagem de carregamento
  if (!perfil) {
    return (
      <div className="w-full max-w-screen-xl mx-auto bg-white text-gray-900 p-8 rounded-md shadow-sm">
        <p className="text-lg text-gray-600">Carregando perfil...</p>
      </div>
    );
  }

  // handler para a conclusão de uma atribuição de um funcionario a uma tarefa
  const concluirTarefaHandler = async (idAtribuicao: string) => {
    concluirTarefa(idAtribuicao);
    setTarefaParaConcluir(null);
  }
  
  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white text-gray-900 p-8 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-8">Lista de Tarefas</h3>

      {loading ? (
        <p className="text-lg text-gray-500">Carregando tarefas...</p>
      ) : (
        <>
          {tarefas && tarefas.length > 0 ? (
            <>
              <ul className="space-y-4">
                {tarefas.map((tarefa) => (
                  <li
                    key={tarefa.tarefaEtapaDTO.id}
                    onClick={() => setTarefaSelecionada(tarefa.tarefaEtapaDTO)}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    {/* Container Principal: Título de um lado, ações do outro */}
                    <div className="flex justify-between items-center">
                      
                      {/* Título (sem alterações) */}
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tarefa.tarefaEtapaDTO.titulo}
                      </h4>

                      {/* Lado Direito: Ações (Tags e novo botão) */}
                      <div className="flex items-center gap-4"> {/* Aumentamos o gap para acomodar o botão */}
                        
                        {/* Tags (sem alterações) */}
                        <div className="flex gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {formatarDisplayStatusDemanda(tarefa.tarefaEtapaDTO.status)}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                            {formatarDisplayPrioridade(tarefa.tarefaEtapaDTO.prioridade)}
                          </span>
                        </div>

                        {/* BOTÃO DE CONCLUIR */}
                        <button
                          onClick={(e) => {
                            // Impede que o clique "vaze" para o <li> pai e abra o modal
                            e.stopPropagation();

                            setTarefaParaConcluir(tarefa);
                            
                          }}
                          // Estilização com Tailwind CSS
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-lg hover:bg-green-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Concluir
                        </button>

                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium text-gray-700">Demanda:</span> {tarefa.tarefaEtapaDTO.demandaDTO?.titulo || "Demanda Desconhecida"}
                      
                      {tarefa.tarefaEtapaDTO.etapaDemandaDTO && (
                        <>
                          {"  ›  "}
                          <span className="font-medium text-gray-700">Etapa:</span> {tarefa.tarefaEtapaDTO.etapaDemandaDTO.titulo}
                        </>
                      )}
                    </p>
                    
                  </li>
                ))}
              </ul>

              {/* Paginação */}
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                  disabled={paginaAtual === 0}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página <span className="font-semibold">{paginaAtual + 1}</span> de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                  disabled={paginaAtual + 1 >= totalPaginas}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Próxima
                </button>
              </div>

            </>
          ) : (
            <p className="text-lg text-gray-500">Nenhuma tarefa encontrada.</p>
          )}
        </>
      )}

      {/* Modal */}
      {tarefaSelecionada && (
        <TarefaFuncionarioModal
          tarefa={tarefaSelecionada}
          onClose={() => setTarefaSelecionada(null)}
        />
      )}

      {tarefaParaConcluir && (
        <ConfirmacaoConcluirModal
          tarefa={tarefaParaConcluir}
          onClose={() => setTarefaParaConcluir(null)}
          onConcluir={concluirTarefaHandler}
        />
      )}


    </div>
  );
};

export default TarefasFuncionarioList;