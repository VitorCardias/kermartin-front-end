import React, { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Titulo from "../components/Titulo";
import CardTarefa from "../components/CardTarefa";
import Paginacao from "../components/Paginacao";
import StatusFiltro from "../components/StatusFiltro";
import FiltrosAvancadosTarefa from "../components/modals/Tarefa/FiltrosAvancadosTarefa";
import CadastroTarefa from "../components/modals/Tarefa/CadastroTarefa";
import { useTarefasListagem, type FiltrosTarefaAvancados } from "../Hooks/useTarefasListagem";
import { useTarefa } from "../Hooks/useTarefa";

const Tarefas: React.FC = () => {
  const location = useLocation();
  const {
    tarefas,
    loading,
    paginaAtual,
    totalPaginas,
    filtros,
    demandasParaFiltro,
    atualizarFiltrosAvancados,
    limparFiltros,
    irProxima,
    irAnterior,
    irParaPagina,
    recarregar,
  } = useTarefasListagem();

  const { editarTarefa, deletarTarefa } = useTarefa();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroInicialAplicado, setFiltroInicialAplicado] = useState(false);

  const demandasOptions = useMemo(
    () => demandasParaFiltro.map((demanda) => ({ id: demanda.id, label: demanda.titulo })),
    [demandasParaFiltro]
  );

  React.useEffect(() => {
    if (filtroInicialAplicado) return;

    const filtroInicial = (location.state as any)?.filtroInicial as Partial<FiltrosTarefaAvancados> | undefined;
    if (!filtroInicial) {
      setFiltroInicialAplicado(true);
      return;
    }

    atualizarFiltrosAvancados(filtroInicial);
    setFiltroInicialAplicado(true);
  }, [location.state, filtroInicialAplicado, atualizarFiltrosAvancados]);

  const handleAtualizarFiltros = useCallback(
    (novosFiltros: Partial<FiltrosTarefaAvancados>) => {
      atualizarFiltrosAvancados(novosFiltros);
    },
    [atualizarFiltrosAvancados]
  );

  const handleStatusFiltro = useCallback(
    (status?: string) => {
      handleAtualizarFiltros({ status: status ? [status] : undefined });
    },
    [handleAtualizarFiltros]
  );

  const handleDeleteTarefa = async (tarefaId: string) => {
    try {
      await deletarTarefa(tarefaId);
      await recarregar();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  const handleStatusChange = async (tarefaId: string, novoStatus: string) => {
    const tarefaSelecionada = tarefas.find((tarefa) => tarefa.id === tarefaId);
    if (!tarefaSelecionada) return;

    await editarTarefa(tarefaId, {
      titulo: tarefaSelecionada.titulo,
      descricao: tarefaSelecionada.descricao ?? null,
      prioridade: tarefaSelecionada.prioridade,
      status: novoStatus,
      porcentagemConclusao: tarefaSelecionada.porcentagemConclusao,
      inicioPrazo: tarefaSelecionada.inicioPrazo ?? null,
      conclusaoPrazo: tarefaSelecionada.conclusaoPrazo ?? null,
      etapaDemandaDTO: tarefaSelecionada.etapaDemandaDTO ?? null,
      demandaDTO: tarefaSelecionada.demandaDTO ?? null,
      criador: tarefaSelecionada.criador,
    });

    await recarregar();
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.busca) count++;
    if (filtros.status?.length) count += filtros.status.length;
    if (filtros.prioridade?.length) count += filtros.prioridade.length;
    if (filtros.clientesIds?.length) count += filtros.clientesIds.length;
    if (filtros.funcionariosIds?.length) count += filtros.funcionariosIds.length;
    if (filtros.demandasIds?.length) count += filtros.demandasIds.length;
    return count;
  };

  const LoadingCards = () => (
    <div className="w-full flex flex-col gap-4 items-center justify-center">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-full sm:w-5/6 lg:w-4/5 bg-white rounded-lg shadow-md border-l-6 border-l-gray-200 p-4 sm:p-6 animate-pulse"
        >
          <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
          <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
          <div className="h-3 w-1/2 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-2/3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
          <div className="flex flex-col gap-1">
            <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Tarefas</Titulo>
            <p className="text-muted text-xs sm:text-sm">
              {tarefas.length > 0
                ? `Exibindo ${tarefas.length} tarefa(s)${
                    contarFiltrosAtivos() > 0 ? ` (${contarFiltrosAtivos()} filtro(s) ativo(s))` : ""
                  }`
                : "Nenhuma tarefa encontrada"}
            </p>
          </div>
          <button
            className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Cadastrar Tarefa
          </button>
        </div>

        <FiltrosAvancadosTarefa
          filtrosAtivos={filtros}
          demandasOptions={demandasOptions}
          onAtualizarFiltros={handleAtualizarFiltros}
          onLimparFiltros={limparFiltros}
        />

        <StatusFiltro
          opcoes={[
            { label: "Em Andamento", value: "EmAndamento" },
            { label: "Aguardando", value: "RequerindoEquipe" },
            { label: "Finalizada", value: "Finalizada" },
            { label: "Atrasada", value: "Atrasada" },
            { label: "Cancelada", value: "Cancelada" },
          ]}
          valorAtivo={filtros.status?.[0]}
          onChange={handleStatusFiltro}
          labelTodos="Todas"
        />

        <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center">
          {loading ? (
            <LoadingCards />
          ) : tarefas.length === 0 ? (
            <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-muted text-sm sm:text-base">
                {contarFiltrosAtivos() > 0
                  ? "Nenhuma tarefa encontrada com os filtros selecionados"
                  : "Nenhuma tarefa cadastrada ainda"}
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4 items-center justify-center">
              {tarefas.map((tarefa) => (
                <div key={tarefa.id} className="w-full sm:w-5/6 lg:w-4/5">
                  <CardTarefa
                    tarefa={tarefa}
                    titulo={tarefa.titulo}
                    descricao={tarefa.descricao || "Sem descricao"}
                    prioridade={tarefa.prioridade.toLowerCase() as "baixa" | "media" | "alta"}
                    dataVencimento={tarefa.conclusaoPrazo || ""}
                    responsaveis={[tarefa.criador?.nome || "Sem responsavel"]}
                    onDelete={() => handleDeleteTarefa(tarefa.id)}
                    onEditSuccess={() => recarregar()}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && tarefas.length > 0 && (
          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            loading={loading}
            onAnterior={irAnterior}
            onProxima={irProxima}
            onIrPara={irParaPagina}
          />
        )}
      </div>

      <CadastroTarefa
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          recarregar();
        }}
        contexto="tarefas"
      />
    </>
  );
};

export default Tarefas;
