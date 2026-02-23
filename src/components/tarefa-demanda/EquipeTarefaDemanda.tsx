import React, { useState } from "react";
import { useEquipeTarefa, type MembroEquipeTarefa } from "../../hooks/useEquipeTarefa";
import { useEquipeEtapa } from "../../hooks/useEquipeEtapa";
import { useEquipe } from "../../hooks/useEquipe";
import { useFuncionarios } from "../../hooks/useFuncionarios"; // Importando o seu hook!
import { authApi } from "../../api/AuthService";
import RemoverMembroTarefaModal from "../tarefa-etapa/RemoverMembroTarefaModal";

type EquipeTarefaDemandaProps = {
  idTarefa: string;
  idEtapa?: string; 
  idDemanda?: string; 
  statusTarefa: string;
};

type OpcaoMembro = {
  funcionarioDTO: {
    id: string;
    nomeCompleto: string;
    qualificacaoFuncionario: string;
  }
};

const EquipeTarefaDemanda: React.FC<EquipeTarefaDemandaProps> = ({ idTarefa, idEtapa, idDemanda, statusTarefa }) => {
  // 1. Buscando os dados de todos os contextos possíveis
  const { membrosEquipe, loading, buscarEquipeTarefa } = useEquipeTarefa(idTarefa);
  const { membrosEquipe: equipeEtapa, loading: loadingEquipeEtapa } = useEquipeEtapa(idEtapa || "");
  const { membrosEquipe: equipeDemanda, loading: loadingEquipeDemanda } = useEquipe(idDemanda || "");
  const { funcionarios: listaFuncionarios, loading: loadingFuncionarios } = useFuncionarios(); // Usando seu hook!

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [membroParaRemover, setMembroParaRemover] = useState<null | MembroEquipeTarefa>(null);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);

  // 2. Identificando o contexto atual da tarefa
  const ehTarefaDeEtapa = !!idEtapa;
  const ehTarefaDeDemanda = !!idDemanda && !ehTarefaDeEtapa;
  
  // 3. Mapeando a lista do seu hook para o formato que a interface já espera
  const todosFuncionariosFormatados = listaFuncionarios.map(func => ({
    funcionarioDTO: func
  }));

  // 4. Selecionando quais dados mostrar no Dropdown
  let opcoesMembros: OpcaoMembro[] = [];
  let loadingOpcoes = false;
  let tituloDropdown = "";

  if (ehTarefaDeEtapa) {
    opcoesMembros = equipeEtapa;
    loadingOpcoes = loadingEquipeEtapa;
    tituloDropdown = "Equipe da Etapa";
  } else if (ehTarefaDeDemanda) {
    opcoesMembros = equipeDemanda;
    loadingOpcoes = loadingEquipeDemanda;
    tituloDropdown = "Equipe da Demanda";
  } else {
    // Tarefa Independente!
    opcoesMembros = todosFuncionariosFormatados;
    loadingOpcoes = loadingFuncionarios;
    tituloDropdown = "Todos os Funcionários";
  }

  // Funções de manipulação da equipe
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
    setMembroParaRemover(null);
    buscarEquipeTarefa(); 
  }

  const handleFecharModalParaRemoverMembro = () => {
    setMembroParaRemover(null);
    setModalRemoverAberto(false);
  }

  return (
    <div className="w-full text-gray-900 p-2">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold">Membros Atribuídos</h4>
        <button
          onClick={() => setDropdownAberto(!dropdownAberto)}
          className="px-4 py-2 bg-black text-white rounded-md transition hover:bg-gray-800 text-sm"
        >
          {dropdownAberto ? "Cancelar" : "Atribuir Membro"}
        </button>
      </div>

      {dropdownAberto && (
        <div className="border border-gray-300 shadow-md bg-white rounded-md p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2 border-b pb-2">
            Mostrando membros disponíveis em: <span className="font-semibold text-gray-700">{tituloDropdown}</span>
          </p>
          
          {loadingOpcoes ? (
            <p className="text-sm text-gray-600">Carregando opções...</p>
          ) : opcoesMembros.length === 0 ? (
            <p className="text-sm text-red-500">Nenhum membro disponível para adicionar.</p>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {opcoesMembros.map((membro) => (
                <li
                  key={membro.funcionarioDTO.id}
                  onClick={() => adicionarMembroTarefa(membro.funcionarioDTO.id)}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded-md border-b last:border-0"
                >
                  <strong>{membro.funcionarioDTO.nomeCompleto}</strong> - {membro.funcionarioDTO.qualificacaoFuncionario}
                </li>
              ))}
            </ul>
          )}
          
          {/* Aviso opcional sobre a paginação caso o escritório tenha muitos funcionários */}
          {!ehTarefaDeEtapa && !ehTarefaDeDemanda && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                  Mostrando os 10 primeiros funcionários.
              </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-600">Aguarde, carregando equipe...</p>
      ) : membrosEquipe.length === 0 ? (
        <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
            <p className="text-sm text-gray-500">Nenhum membro atribuído a esta tarefa ainda.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {membrosEquipe.map((membro) => (
            <li
              key={membro.id}
              className="p-4 border border-gray-200 rounded-md bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-base font-medium">{membro.funcionarioDTO.nomeCompleto}</p>
                <p className="text-xs text-gray-600">{membro.funcionarioDTO.qualificacaoFuncionario}</p>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-xs text-gray-500 text-right">
                  Entrou em:<br/> {membro.inicioParticipacao}
                </p>
                <button
                  onClick={() => handleAbrirModalRemocao(membro)}
                  className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded transition hover:bg-red-200 text-sm"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalRemoverAberto && membroParaRemover && (
        <RemoverMembroTarefaModal 
          membroEquipeTarefa={membroParaRemover}
          idTarefa={idTarefa} 
          onClose={handleFecharModalParaRemoverMembro} 
          onRemovido={handleMembroRemovidoComSucesso} 
        />
      )}
    </div>
  );
};

export default EquipeTarefaDemanda;