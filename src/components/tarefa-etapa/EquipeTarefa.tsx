import React, { useState } from "react";
import { useEquipeTarefa, type MembroEquipeTarefa } from "../../hooks/useEquipeTarefa";
import { useEquipeEtapa } from "../../hooks/useEquipeEtapa";
import { authApi } from "../../api/AuthService";
import RemoverMembroTarefaModal from "./RemoverMembroTarefaModal";

type EquipeTarefaProps = {
  idTarefa: string;
  idEtapa: string;
  statusTarefa: string;
};

const EquipeTarefa: React.FC<EquipeTarefaProps> = ({ idTarefa, idEtapa,  statusTarefa}) => {
  const { membrosEquipe, loading, buscarEquipeTarefa } = useEquipeTarefa(idTarefa);
  const { membrosEquipe: equipeEtapa, loading: loadingEquipeEtapa } = useEquipeEtapa(idEtapa);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [membroParaRemover, setMembroParaRemover] = useState<null | MembroEquipeTarefa>(null);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);

  const adicionarMembroTarefa = async (funcionarioId: string) => {

    try {
      await authApi.post("/membro-equipe-tarefa", {
        tarefaDTO: { id: idTarefa },
        funcionarioDTO: { id: funcionarioId },
        status: statusTarefa
      });

      buscarEquipeTarefa();
      setDropdownAberto(false);
    } catch (error) {
      console.error("Erro ao adicionar membro à equipe da tarefa: ", error);
    }
  };

  const handleAbrirModalRemocao = (membroEquipeTarefa: MembroEquipeTarefa) => {
    setMembroParaRemover(membroEquipeTarefa);
    setModalRemoverAberto(true);
  }

  const handleMembroRemovidoComSucesso = () => {
    setMembroParaRemover(null); // Limpar o campo de membro para remover
    buscarEquipeTarefa(); // Recarrega a equipe neste componente (EquipeTarefa)
  }

  const handleFecharModalParaRemoverMembro = () => {
    setMembroParaRemover(null);
    setModalRemoverAberto(false);
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-900 p-6">
      <h4 className="text-2xl font-semibold mb-6">Equipe da Tarefa</h4>

      <button
        onClick={() => setDropdownAberto(!dropdownAberto)}
        className="mb-4 px-4 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
      >
        Adicionar Membro
      </button>

      {dropdownAberto && (
        <div className="border border-gray-300 shadow-md bg-white rounded-md p-4">
          {loadingEquipeEtapa ? (
            <p className="text-lg text-gray-600">Carregando equipe da etapa...</p>
          ) : (
            <ul>
              {equipeEtapa.map((membro) => (
                <li
                  key={membro.funcionarioDTO.id}
                  onClick={() => adicionarMembroTarefa(membro.funcionarioDTO.id)}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded-md"
                >
                  <strong>{membro.funcionarioDTO.nomeCompleto}</strong> - {membro.funcionarioDTO.qualificacaoFuncionario}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-lg text-gray-600">Aguarde, carregando equipe...</p>
      ) : membrosEquipe.length === 0 ? (
        <p className="text-lg text-gray-600">Nenhum membro encontrado para esta tarefa.</p>
      ) : (
        <ul className="space-y-4">
          {membrosEquipe.map((membro) => (
            <>
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
            </>
          ))}
        </ul>
      )}

      {modalRemoverAberto && (
        <RemoverMembroTarefaModal 
          membroEquipeTarefa={membroParaRemover}
          idTarefa = {idTarefa} 
          onClose={handleFecharModalParaRemoverMembro} 
          onRemovido={handleMembroRemovidoComSucesso} 
        />
      )}

    </div>
  );
};

export default EquipeTarefa;

