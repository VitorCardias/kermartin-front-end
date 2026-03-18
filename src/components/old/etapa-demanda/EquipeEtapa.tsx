import React, { useState } from "react";
import { useEquipe } from "../../../Hooks/useEquipe";
import { authApi } from "../../../api/AuthService";
import { useEquipeEtapa, type MembroEquipeEtapa } from "../../../Hooks/useEquipeEtapa";
import RemoverMembroEtapaModal from "./RemoverMembroEtapaModal";

type EquipeEtapaProps = {
  idEtapa: string;
  idDemanda: string;
};

const EquipeEtapa: React.FC<EquipeEtapaProps> = ({ idEtapa, idDemanda }) => {
  const { membrosEquipe, loading, paginaAtual, setPaginaAtual, totalPaginas, buscarEquipeEtapa } = useEquipeEtapa(idEtapa);
  const { membrosEquipe: equipeDemanda, loading: loadingDemanda } = useEquipe(idDemanda);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [membroParaRemover, setMembroParaRemover] = useState<null | MembroEquipeEtapa>(null);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);

  const adicionarMembroEtapa = async (funcionarioId: string) => {
    try {
      await authApi.post("/membro-equipe-etapa", {
        etapaDemandaDTO: { id: idEtapa },
        funcionarioDTO: { id: funcionarioId }
      });

      buscarEquipeEtapa(); // Atualizar a lista após adicionar
      setDropdownAberto(false);
    } catch (error) {
      console.error("Erro ao adicionar membro à equipe da etapa:", error);
    }
  };

  const handleAbrirModalRemocao = (membroEquipeEtapa: MembroEquipeEtapa) => {
    setMembroParaRemover(membroEquipeEtapa);
    setModalRemoverAberto(true);
  }

  const handleMembroRemovidoComSucesso = () => {
    setMembroParaRemover(null); // Limpar o campo de membro para remover
    buscarEquipeEtapa(); // Recarrega a equipe neste componente (EquipeDemanda)
  }

  const handleFecharModalParaRemoverMembro = () => {
    setMembroParaRemover(null);
    setModalRemoverAberto(false);
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-900 p-6">
      <h4 className="text-2xl font-semibold mb-6">Equipe da Etapa</h4>

      {/* Botão para abrir dropdown */}
      <button
        onClick={() => setDropdownAberto(!dropdownAberto)}
        className="mb-4 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
      >
        Adicionar Membro
      </button>

      {dropdownAberto && (
        <div className="border border-gray-300 shadow-md p-4 bg-white rounded-md">
          {loadingDemanda ? (
            <p className="text-lg text-gray-600">Carregando equipe da demanda...</p>
          ) : (
            <ul className="space-y-4">
              {equipeDemanda.map((membro) => (
                <li
                  key={membro.funcionarioDTO.id}
                  onClick={() => adicionarMembroEtapa(membro.funcionarioDTO.id)}
                  className="p-4 border border-gray-300 rounded-md cursor-pointer transition hover:bg-gray-100"
                >
                  <p className="text-lg font-medium">{membro.funcionarioDTO.nomeCompleto}</p>
                  <p className="text-gray-600">{membro.funcionarioDTO.qualificacaoFuncionario}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-lg text-gray-600">Aguarde, carregando equipe...</p>
      ) : membrosEquipe.length === 0 ? (
        <p className="text-lg text-gray-600">Nenhum membro encontrado para esta etapa.</p>
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

      {modalRemoverAberto && (
        <RemoverMembroEtapaModal 
          membroEquipeEtapa={membroParaRemover}
          idEtapa = {idEtapa} 
          onClose={handleFecharModalParaRemoverMembro} 
          onRemovido={handleMembroRemovidoComSucesso} 
        />
      )}

    </div>

  );
};

export default EquipeEtapa;
