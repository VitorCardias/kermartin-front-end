import React, { useEffect, useState } from "react";
import { useDemandas, type Demanda } from "../../hooks/useDemandas";
import DemandaModal from "./DemandaModal";
import DemandaEditModal from "./DemandaEditModal";
import DemandaCadastroModal from "./DemandaCadastroModal";
import DemandaExcluirModal from "./DemandaExcluirModal";
import DemandaStatusNavigator from "./DemandasStatusNavigator";
import type { StatusDemandaTipo } from "../../types/TiposDemandas";
import DemandaFiltro from "./DemandaFiltro";

interface UpdateSignal {
  timestamp: number; // Para garantir que o objeto seja sempre novo
  statuses: StatusDemandaTipo[]; // Lista de status que precisam de refetch
}


const DemandaList: React.FC = () => {
  // Funções de CRUD do useDemandas
  const { cadastrarDemanda, editarDemanda, deletarDemanda } = useDemandas();

  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null); // Para modal de detalhes
  const [demandaEditando, setDemandaEditando] = useState<Demanda | null>(null); // Para modal de edição
  const [demandaExcluida, setDemandaExcluir] = useState<Demanda | null>(null); // Para modal de exclusão
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false); // Para modal de cadastro
  const [updateSignal, setUpdateSignal] = useState<UpdateSignal>({ timestamp: 0, statuses: [] });
  const [equipeUpdateSignal, setEquipeUpdateSignal] = useState({ timestamp: 0, demandaId: '' });
  const [termoFiltro, setTermoFiltro] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<'funcionario' | 'cliente'>('funcionario');

  // Função para acionar o sinal de atualização
  const triggerUpdate = (affectedStatuses: StatusDemandaTipo[]) => {
    // Usamos um Set para garantir que não haja status duplicados
    const uniqueStatuses = Array.from(new Set(affectedStatuses));
    setUpdateSignal({
      timestamp: Date.now(), // Garante que o objeto seja sempre uma nova referência
      statuses: uniqueStatuses,
    });
  };

  // Função para acionar a atualização de uma equipe
  const triggerEquipeUpdate = (demandaId: string) => {
    setEquipeUpdateSignal({
      timestamp: Date.now(),
      demandaId: demandaId,
    });
  };

  // Handler de Cadastro
  const handleCadastroSubmit = async (novaDemandaData: Omit<Demanda, 'id' | 'criador'>) => {
    const demandaCriada = await cadastrarDemanda(novaDemandaData);
    if (demandaCriada) {
      // Acione a atualização APENAS para a coluna de destino
      triggerUpdate([demandaCriada.statusDemanda as StatusDemandaTipo]);
      setModalCadastroAberto(false);
    } else {
      // Tratar erro
    }
  };

  // Handler de Edição
  const handleEdicaoSubmit = async (demandaEditada: Demanda) => {
    const statusAnterior = demandaEditando?.statusDemanda as StatusDemandaTipo;
    const demandaAtualizada = await editarDemanda(demandaEditada);
    if (demandaAtualizada) {
      // Acione a atualização para a coluna de origem E a de destino
      // O Set cuida do caso em que o status não muda (só haverá 1 item)
      triggerUpdate([statusAnterior, demandaAtualizada.statusDemanda as StatusDemandaTipo]);
      setDemandaEditando(null);
    } else {
      // Tratar erro
    }
  };

  // Handler de Exclusão
  const handleDeleteSubmit = async (demandaExcluir: Demanda) => {
    const demandDeletada = await deletarDemanda(demandaExcluir);
    if (demandDeletada) {
      // Acione a atualização APENAS para a coluna onde a demanda estava
      triggerUpdate([demandaExcluir.statusDemanda as StatusDemandaTipo]);
      setDemandaExcluir(null);
      setDemandaEditando(null);
    } else {
      // Tratar erro
    }
  };
  
  // Handler de Equipe Alterada
  const handleEquipeUpdatedInModal = () => {
    if (demandaSelecionada) {
      // A lógica antiga recarregava a coluna inteira, o que é ineficiente e incorreto para este caso.
      // triggerUpdate([demandaSelecionada.statusDemanda as StatusDemandaTipo]);
      
      // NOVO E CORRETO: Aciona o sinal específico para a equipe daquela demanda.
      triggerEquipeUpdate(demandaSelecionada.id);
    }
  };

  // Handler para abrir o modal de detalhes de uma demanda
  const handleViewDemandaDetails = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
  };

  // Handler para abrir o modal de edição de uma demanda
  const handleEditDemanda = (demanda: Demanda) => {
    setDemandaEditando(demanda);
  };

  // Handler para abrir o modal de exclusão de uma demanda
  const handleDeleteDemanda = (demanda: Demanda) => {
    setDemandaExcluir(demanda);
  }

  // Handler para abrir o modal de cadastro (chamado pelo botão "Nova Demanda")
  const handleOpenCadastroModal = () => {
    setModalCadastroAberto(true);
  }

  const handleTipoFiltroChange = (novoTipo: 'funcionario' | 'cliente') => {
    setTipoFiltro(novoTipo);
    setTermoFiltro(''); // Limpa o ID ao mesmo tempo que muda o tipo
  };

  useEffect(() => {
    // Se a lista de status para atualizar não estiver vazia (ou seja, um sinal foi emitido)...
    if (updateSignal.statuses.length > 0) {
      console.log("Sinal emitido com alvos:", updateSignal.statuses, ". Agendando limpeza do sinal para o próximo ciclo.");
      // Agenda uma nova atualização de estado para a próxima renderização,
      // que limpará a lista de status, efetivamente "consumindo" o sinal.
      setUpdateSignal(prevSignal => ({
        timestamp: prevSignal.timestamp, // Mantém o mesmo timestamp para não ser um "novo" sinal
        statuses: [], // Limpa a lista de alvos
      }));
    }
  }, [updateSignal]); // Este efeito roda sempre que o sinal muda.

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white text-gray-900 p-8 rounded-md shadow-sm">

      <div className="flex justify-between items-center"> 
        <h3 className="text-2xl font-semibold mb-6">Gerenciamento de Demandas</h3>

        <button
          onClick={handleOpenCadastroModal}
          className="mb-4 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
        >
          Nova Demanda
        </button>
      </div>

      {/** Filtro de Pesquisa */}
      <DemandaFiltro 
        termoFiltro={termoFiltro}
        setTermoFiltro={setTermoFiltro}
        tipoFiltro={tipoFiltro}
        onTipoFiltroChange={handleTipoFiltroChange}
      />

      <DemandaStatusNavigator
        onEditDemanda={handleEditDemanda}
        onViewDemandaDetails={handleViewDemandaDetails}
        filtro={termoFiltro}
        tipoFiltro={tipoFiltro}
        updateSignal={updateSignal}
        equipeUpdateSignal={equipeUpdateSignal}
      />
      
      {demandaSelecionada && (
        <DemandaModal
          demanda={demandaSelecionada}
          onClose={() => setDemandaSelecionada(null)}
          onEquipeAlterada={handleEquipeUpdatedInModal}
        />
      )}

      {demandaEditando && (
        <DemandaEditModal
          demanda={demandaEditando}
          onClose={() => setDemandaEditando(null)}
          onUpdate={handleEdicaoSubmit} // Chama o handler que edita E aciona o refetch
          onDeleteModal={handleDeleteDemanda}
        />
      )}

      {demandaExcluida && (
        <DemandaExcluirModal
          demanda={demandaExcluida}
          onClose={() => setDemandaExcluir(null)}
          onDelete={handleDeleteSubmit} // Chama o handler que exclui e aciona o refetch
        />
      )}

      {modalCadastroAberto && (
        <DemandaCadastroModal
          onClose={() => setModalCadastroAberto(false)}
          onCadastro={handleCadastroSubmit} // Chama o handler que cadastra E aciona o refetch
        />
      )}

    </div>
  );
  
}

export default DemandaList;
