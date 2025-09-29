import React from "react";
import type { TarefaFuncionario } from "../../hooks/useTarefasFuncionario";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../types/TiposDemandas";

type TarefaFuncionarioModalProps = {
  tarefa: TarefaFuncionario;
  onClose: () => void;
};

const TarefaFuncionarioModal: React.FC<TarefaFuncionarioModalProps> = ({ tarefa, onClose }) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <h3 className="text-3xl font-bold mb-4 text-gray-900">Detalhes da Tarefa</h3>

        {/* Contexto destacado */}
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-lg mb-6 border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          <span className="font-medium">{tarefa.etapaDemandaDTO.demanda.titulo}</span>
          <span className="text-gray-400">›</span>
          <span>{tarefa.etapaDemandaDTO.titulo}</span>
        </div>

        {/* Informações principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Título</p>
            <p className="text-lg text-gray-900">{tarefa.titulo}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
            <p className="text-lg text-gray-900">{formatarDisplayStatusDemanda(tarefa.status)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Prioridade</p>
            <p className="text-lg text-gray-900">{formatarDisplayPrioridade(tarefa.prioridade)}</p>
          </div>
        </div>

        {/* Prazos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Prazo Início</p>
            <p className="text-lg text-gray-900">{tarefa.inicioPrazo}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Prazo Conclusão</p>
            <p className="text-lg text-gray-900">{tarefa.conclusaoPrazo}</p>
          </div>
        </div>

        {/* Descrição em caixa suave */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Descrição</p>
          <p className="text-gray-800 whitespace-pre-line leading-relaxed">{tarefa.descricao}</p>
        </div>

        {/* Botão */}
        <button
          onClick={onClose}
          className="mt-8 w-full px-6 py-3 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
        >
          Fechar
        </button>
      </div>
    </div>

  );
};

export default TarefaFuncionarioModal;
