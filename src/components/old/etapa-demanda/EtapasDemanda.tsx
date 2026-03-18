import React, { useState } from "react";
import { useEtapas } from "../../../Hooks/useEtapas";
import EditarEtapaModal from "./EditarEtapaModal";
import AdicionarEtapaModal from "./AdicionarEtapaModal"; // Importando o modal de cadastro
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../../types/TiposDemandas";

type EtapasDemandaProps = {
  idDemanda: string;
};

const EtapasDemanda: React.FC<EtapasDemandaProps> = ({ idDemanda }) => {
  const { etapas, loading, paginaAtual, setPaginaAtual, totalPaginas, buscarEtapas, deletarEtapaDemanda } = useEtapas(idDemanda);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [etapaSelecionada, setEtapaSelecionada] = useState<null | typeof etapas[0]>(null);

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-900 p-6">
      <h4 className="text-2xl font-semibold mb-6">Lista de Etapas da Demanda</h4>

      {/* Botão para abrir o modal de adicionar etapa */}
      <button
        onClick={() => setModalCadastroAberto(true)}
        className="mb-6 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
      >
        Adicionar Etapa
      </button>

      {loading ? (
        <p className="text-lg text-gray-600">Carregando etapas...</p>
      ) : (
        <ul className="space-y-4">
          {etapas.map((etapa) => (
            <li
              key={etapa.id}
              onClick={() => { setEtapaSelecionada(etapa); setModalAberto(true); }}
              className="p-4 border border-gray-300 rounded-md cursor-pointer transition hover:bg-gray-100"
            >
              <p className="text-lg font-medium">{etapa.titulo}</p>
              <p className="text-sm text-gray-600">Prioridade: {formatarDisplayPrioridade(etapa.prioridade)} | Status: {formatarDisplayStatusDemanda(etapa.status)}</p>
              <p className="text-sm text-gray-500">Conclusão: {etapa.porcentagemConclusao}%</p>
              <p className="text-sm text-gray-500">
                Prazo: {etapa.inicioPrazo ?? "Não definido"} até {etapa.conclusaoPrazo ?? "Não definido"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Paginação aprimorada */}
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

      {/* Modal de cadastro de etapa */}
      {modalCadastroAberto && (
        <AdicionarEtapaModal
          idDemanda={idDemanda}
          onClose={() => setModalCadastroAberto(false)}
          onAdicionado={buscarEtapas}
        />
      )}

      {/* Modal de edição de etapa */}
      {modalAberto && etapaSelecionada && (
        <EditarEtapaModal
          etapa={etapaSelecionada}
          idDemanda={idDemanda}
          onClose={() => setModalAberto(false)}
          onAtualizado={buscarEtapas}
          deletar={deletarEtapaDemanda}
        />
      )}

    </div>
  );
};

export default EtapasDemanda;

