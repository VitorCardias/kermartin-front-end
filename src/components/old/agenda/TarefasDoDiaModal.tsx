import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../types/TiposDemandas";
import type { TarefaDemandaAPI } from "../../Hooks/useTarefasDemandas";

type TarefasDoDiaModalProps = {
  data: Date;
  tarefas: TarefaDemandaAPI[]; 
  onClose: () => void;
  onTarefaClick: (tarefa: TarefaDemandaAPI) => void;
  onAdicionarNova: () => void;
};

const TarefasDoDiaModal: React.FC<TarefasDoDiaModalProps> = ({ data, tarefas, onClose, onTarefaClick, onAdicionarNova }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl shadow-sm">
              <span className="text-xl font-bold">{format(data, "dd")}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                {format(data, "EEEE", { locale: ptBR })}
              </h3>
              <p className="text-sm text-gray-500 font-medium capitalize">
                {format(data, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          {tarefas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Nenhuma tarefa encontrada para este dia.</p>
              <button onClick={onAdicionarNova} className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition shadow-md">
                + Criar Primeira Tarefa
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {tarefas.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => onTarefaClick(t)}
                    className="group relative p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                      t.prioridade === "Alta" ? "bg-red-500" : t.prioridade === "Media" ? "bg-yellow-500" : "bg-blue-500"
                    }`} />

                    <div>
                      <div className="flex justify-between items-start mb-3 mt-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          t.prioridade === "Alta" ? "bg-red-50 text-red-700 border-red-100" : 
                          t.prioridade === "Media" ? "bg-yellow-50 text-yellow-700 border-yellow-100" : 
                          "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {formatarDisplayPrioridade(t.prioridade)}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full truncate max-w-[120px]">
                          {formatarDisplayStatusDemanda(t.status)}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {t.titulo}
                      </h4>
                      
                      <div className="text-xs text-gray-500 mb-4 line-clamp-1">
                        {t.etapaDemandaDTO ? (
                          <>Etapa: <span className="font-semibold text-gray-700">{t.etapaDemandaDTO.titulo}</span></>
                        ) : t.demandaDTO ? (
                          <>Demanda: <span className="font-semibold text-gray-700">{t.demandaDTO.titulo}</span></>
                        ) : (
                          <span className="font-medium text-gray-600">Tarefa Independente</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">{t.porcentagemConclusao}% Concluído</span>
                       <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-black transition-all" style={{ width: `${t.porcentagemConclusao}%` }} />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center border-t border-gray-200 pt-6">
                <button onClick={onAdicionarNova} className="px-6 py-2.5 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-xl font-medium hover:border-black hover:text-black transition">
                  + Adicionar Nova Tarefa Neste Dia
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarefasDoDiaModal;