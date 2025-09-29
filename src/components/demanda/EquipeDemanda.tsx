import React, { useState } from "react";
import { useEquipe, type MembroEquipeDemanda } from "../../hooks/useEquipe";
import AdicionarMembroModal from "./AdicionarMembroModal";
import RemoverMembroDemandaModal from "./RemoverMembroDemandaModal";
import ToastExclusaoMembroEquipeComSucesso from "../etapa-demanda/ToastExclusaoMembroEquipeComSucesso";

type EquipeDemandaProps = {
  idDemanda: string;
  onEquipeAlteradaNaListaPrincipal?: () => void; // Opcional para flexibilidade
};

const EquipeDemanda: React.FC<EquipeDemandaProps> = ({ idDemanda, onEquipeAlteradaNaListaPrincipal }) => {
  const { membrosEquipe, loading, buscarEquipe, paginaAtual, setPaginaAtual, totalPaginas } = useEquipe(idDemanda);
  const [membroParaRemover, setMembroParaRemover] = useState<null | MembroEquipeDemanda>(null);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
  const [toastExclusaoMembroComSucesso, setToastExclusaoMembroComSucesso] = useState(false);


  const handleMembroAdicionadoComSucesso = () => {
    buscarEquipe(); // Recarrega a equipe neste componente (EquipeDemanda)
    if (onEquipeAlteradaNaListaPrincipal) {
      onEquipeAlteradaNaListaPrincipal(); // Sinaliza para DemandaList (via DemandaModal)
    }
  }

  const handleAbrirModalRemocao = (membroEquipeDemanda: MembroEquipeDemanda) => {
    setMembroParaRemover(membroEquipeDemanda);
    setModalRemoverAberto(true);
  }

  const handleMembroRemovidoComSucesso = () => {
    setMembroParaRemover(null); // Limpar o campo de membro para remover
    buscarEquipe(); // Recarrega a equipe neste componente (EquipeDemanda)
    setToastExclusaoMembroComSucesso(true);
    if (onEquipeAlteradaNaListaPrincipal) {
      onEquipeAlteradaNaListaPrincipal(); // Sinaliza para DemandaList (via DemandaModal)
    }
  }

  const handleFecharModalParaRemoverMembro = () => {
    setMembroParaRemover(null);
    setModalRemoverAberto(false);
  }
  

  return (
    <div className="w-full text-gray-900 p-0 md:p-6">
      
      {/* Cabeçalho da Aba */}
      <div className="flex justify-between items-center mb-6">
        
        {/* Título do Conteúdo da aba */}
        <h4 className="text-2xl font-semibold">Equipe responsável pela demanda</h4>

        {/* Botão de adicionar membro */}
        <button
          onClick={() => setModalAdicionarAberto(true)}
          className="mb-4 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
        >
          Adicionar Membro
        </button>

      </div>

      {/* Corpo da Aba*/}
      <div>
        {loading && membrosEquipe.length === 0 ? (
          <p className="text-lg text-gray-600">Carregando equipe...</p>
        ) : (
          <>
            {/* Lista da Equipe de Demanda */}
            {membrosEquipe.length === 0 && !loading ? (
              <p className="text-gray-600">Nenhum membro na equipe.</p>
            ) : (
              <ul className="space-y-4">
                {membrosEquipe.map((membro) => (
                  <li
                    key={membro.id}
                    className="p-4 border border-gray-300 rounded-md bg-white shadow-sm"
                  >
                    <div>
                      <p className="text-lg font-medium">{membro.funcionarioDTO.nomeCompleto}</p>
                      <p className="text-gray-600">{membro.funcionarioDTO.qualificacaoFuncionario}</p>
                      <p className="text-sm text-gray-500">
                        Participação: {membro.inicioParticipacao} {membro.terminoParticipacao ? `até ${membro.terminoParticipacao}` : "(Em andamento)"}
                      </p>
                    </div>

                    <hr className="mt-2 border-gray-300"></hr>

                    <div className="mt-2">
                      <button
                        onClick={() => handleAbrirModalRemocao(membro)}
                        className="px-0 py-1 w-25 bg-red-700 text-white rounded-md transition hover:bg-red-500 cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                    
                  </li>
                ))}
              </ul>
            )}
            
            {/* Paginação da Lista da Equipe de Demanda */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                  disabled={paginaAtual === 0 || loading}
                  className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400"
                >
                  Anterior
                </button>
                <span className="text-lg font-medium text-gray-700">
                  Página {paginaAtual + 1} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                  disabled={paginaAtual + 1 >= totalPaginas || loading}
                  className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {modalAdicionarAberto && (
        <AdicionarMembroModal 
          idDemanda={idDemanda} 
          onClose={() => setModalAdicionarAberto(false)} 
          onAdicionado={handleMembroAdicionadoComSucesso} 
        />
      )}

      {modalRemoverAberto && (
        <RemoverMembroDemandaModal 
          membroEquipeDemanda={membroParaRemover}
          idDemanda = {idDemanda} 
          onClose={handleFecharModalParaRemoverMembro} 
          onRemovido={handleMembroRemovidoComSucesso} 
        />
      )}

      {toastExclusaoMembroComSucesso && (
        <ToastExclusaoMembroEquipeComSucesso
          onClose={() => setToastExclusaoMembroComSucesso(false)}
        />
      )}
  
    </div>
  );
};

export default EquipeDemanda;
