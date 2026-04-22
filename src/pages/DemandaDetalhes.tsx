import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Titulo from "../components/Titulo";
import { useTarefa } from "../Hooks/useTarefa";
import download from "../assets/icon-download.svg";
import CardTarefa from "../components/CardTarefa";
import CardEtapa from "../components/CardEtapa";
import CadastroEtapa from "../components/modals/Etapa/CadastroEtapa";
import CadastroTarefa from "../components/modals/Tarefa/CadastroTarefa";
import { useEtapas } from "../Hooks/useEtapas";
import { useEquipe } from "../Hooks/useEquipe";

type DemandaDetalheState = {
  demanda?: {
    id?: string;
    titulo?: string;
    clienteDto?: {
      nome?: string;
    };
    statusDemanda?: string;
    descricao?: string;
    conclusaoPrazo?: string | null;
    responsavelList?: Array<{
      nome?: string;
      funcionarioDTO?: {
        nomeCompleto?: string;
      };
    }>;
  };
};

const statusLabel = (status?: string) => {
  const mapa: Record<string, string> = {
    EmAndamento: "EM ANDAMENTO",
    RequerindoEquipe: "AGUARDANDO EQUIPE",
    Finalizada: "FINALIZADA",
    Atrasada: "ATRASADA",
    Cancelada: "CANCELADA",
  };

  return mapa[status || ""] || "EM ANDAMENTO";
};

const getStatusColors = (status?: string): { bg: string; text: string } => {
  switch (status) {
    case "RequerindoEquipe":
      return { bg: "bg-status-wait", text: "text-status-wait" };
    case "EmAndamento":
      return { bg: "bg-status-inprogress", text: "text-status-inprogress" };
    case "Finalizada":
      return { bg: "bg-status-completed", text: "text-status-completed" };
    case "Atrasada":
      return { bg: "bg-status-delayed", text: "text-status-delayed" };
    default:
      return { bg: "bg-status-inprogress", text: "text-status-inprogress" };
  }
};

const LoadingTarefasSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 animate-pulse border border-default"
      >
        <div className="h-4 w-44 bg-gray-200 rounded mb-3" />
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-1/2 bg-gray-100 rounded mb-2" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
    ))}
  </div>
);

const DemandaDetalhes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as DemandaDetalheState | null;
  const demanda = state?.demanda;

  const [isModalEtapaOpen, setIsModalEtapaOpen] = useState(false);
  const [isModalTarefaOpen, setIsModalTarefaOpen] = useState(false);
  const [etapaSelecionadaIds, setEtapaSelecionadaIds] = useState<Set<string>>(new Set());
  const [mostrarSemEtapa, setMostrarSemEtapa] = useState(false);

  const { etapas, buscarEtapas } = useEtapas(id || "");
  const { membrosEquipe } = useEquipe(id || "");
  const {
    tarefas,
    buscarTarefas,
    formatarDataExibicao,
    loading: loadingTarefas,
    deletarTarefa,
    editarTarefa,
  } = useTarefa();

  const nomeCliente = demanda?.clienteDto?.nome || "Cliente nao informado";
  const tituloDemanda = demanda?.titulo || "Demanda";
  const prazoDemanda = demanda?.conclusaoPrazo || "";
  const responsaveisDaEquipe =
    membrosEquipe?.map((membro) => membro.funcionarioDTO.nomeCompleto).filter(Boolean) || [];
  const responsaveisDoState =
    demanda?.responsavelList
      ?.map((responsavel) => responsavel.nome || responsavel.funcionarioDTO?.nomeCompleto)
      .filter(Boolean) || [];
  const responsavelPrincipal =
    (responsaveisDaEquipe.length > 0
      ? responsaveisDaEquipe.join(", ")
      : responsaveisDoState.length > 0
        ? responsaveisDoState.join(", ")
        : "Sem atribuicao");

  useEffect(() => {
    if (id) {
      buscarTarefas("demanda", id);
    }
  }, [id]);

  const tarefasFiltradas =
    etapaSelecionadaIds.size === 0 && !mostrarSemEtapa
      ? tarefas
      : tarefas.filter((tarefa) => {
          const etapaId = tarefa.etapaDemandaDTO?.id;
          const pertenceEtapaSelecionada = !!etapaId && etapaSelecionadaIds.has(etapaId);
          const pertenceSemEtapa = mostrarSemEtapa && !etapaId;
          return pertenceEtapaSelecionada || pertenceSemEtapa;
        });

  const porcentagemEtapaMap = React.useMemo(() => {
    const agrupado = new Map<string, { soma: number; quantidade: number }>();

    tarefas.forEach((tarefa) => {
      const etapaId = tarefa.etapaDemandaDTO?.id;
      if (!etapaId) return;

      const percentualTarefa =
        tarefa.status?.toLowerCase().includes("finalizad")
          ? 100
          : Math.min(Math.max(tarefa.porcentagemConclusao || 0, 0), 100);

      const atual = agrupado.get(etapaId) || { soma: 0, quantidade: 0 };
      agrupado.set(etapaId, {
        soma: atual.soma + percentualTarefa,
        quantidade: atual.quantidade + 1,
      });
    });

    const resultado = new Map<string, number>();
    agrupado.forEach((valor, etapaId) => {
      resultado.set(etapaId, Math.round(valor.soma / valor.quantidade));
    });

    return resultado;
  }, [tarefas]);

  const handleModalEtapaClose = () => {
    setIsModalEtapaOpen(false);
  };

  const handleModalTarefaClose = () => {
    setIsModalTarefaOpen(false);
  };

  const handleModalSuccess = () => {
    buscarEtapas();
    if (id) {
      buscarTarefas("demanda", id);
    }
  };

  const handleEtapaClick = (etapaId: string, _isMultiple: boolean) => {
    setEtapaSelecionadaIds((prevIds) => {
      const novoSet = new Set(prevIds);

      if (novoSet.has(etapaId)) {
        novoSet.delete(etapaId);
      } else {
        novoSet.add(etapaId);
      }

      return novoSet;
    });
  };

  const handleDeleteTarefa = async (tarefaId: string) => {
    try {
      await deletarTarefa(tarefaId);
      if (id) {
        buscarTarefas("demanda", id);
      }
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  const handleStatusChange = async (tarefaId: string, novoStatus: string) => {
    const tarefaSelecionada = tarefas.find((tarefa) => tarefa.id === tarefaId);
    if (!tarefaSelecionada) return;

    const novaPorcentagem = novoStatus.toLowerCase().includes("finalizad")
      ? 100
      : 0;

    await editarTarefa(tarefaId, {
      titulo: tarefaSelecionada.titulo,
      descricao: tarefaSelecionada.descricao ?? null,
      prioridade: tarefaSelecionada.prioridade,
      status: novoStatus,
      porcentagemConclusao: novaPorcentagem,
      inicioPrazo: tarefaSelecionada.inicioPrazo ?? null,
      conclusaoPrazo: tarefaSelecionada.conclusaoPrazo ?? null,
      etapaDemandaDTO: tarefaSelecionada.etapaDemandaDTO ?? null,
      demandaDTO: tarefaSelecionada.demandaDTO ?? null,
      criador: tarefaSelecionada.criador,
    });

    if (id) {
      await buscarTarefas("demanda", id);
    }
  };

  const statusColors = getStatusColors(demanda?.statusDemanda);
  const filtrosAtivos = etapaSelecionadaIds.size + (mostrarSemEtapa ? 1 : 0);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_320px] gap-4">
        <aside className="bg-white border border-default rounded-xl p-4 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/demanda")}
              className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center hover:brightness-110 transition cursor-pointer"
              aria-label="Voltar para demandas"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p className="text-xs text-muted">Demandas / Detalhes</p>
          </div>
          <span className={`inline-flex mt-5 px-3 py-1 rounded text-xs font-semibold w-full ${statusColors.bg} ${statusColors.text}`}>
            {statusLabel(demanda?.statusDemanda)}
          </span>

          <Titulo tamanho="text-lg mt-4">{tituloDemanda}</Titulo>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">CLIENTE:</p>
              <p className="text-main text-md font-semibold">{nomeCliente}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">RESPONSAVEL:</p>
              <p className="text-main text-md font-semibold">{responsavelPrincipal}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">PRAZO FINAL:</p>
              <p className="text-main text-md font-semibold">
                {prazoDemanda ? formatarDataExibicao(prazoDemanda) : "Sem prazo"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">DESCRICAO:</p>
              <p className="text-main text-md font-semibold">{demanda?.descricao || "Descricao nao informada"}</p>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-8 bg-primary text-white text-xs font-semibold py-2.5 rounded-lg hover:brightness-110 transition cursor-pointer"
          >
            EMITIR RELATORIO
            <img src={download} alt="Icone de download" className="inline-block w-3 h-3 ml-2" />
          </button>
        </aside>

        <section className="bg-white border border-default rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-6 border-b border-default pb-3 overflow-x-auto no-scrollbar">
            <button
              className={`font-semibold text-sm cursor-pointer whitespace-nowrap transition ${
                etapaSelecionadaIds.size === 0 && !mostrarSemEtapa
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-primary"
              }`}
              onClick={() => {
                setEtapaSelecionadaIds(new Set());
                setMostrarSemEtapa(false);
              }}
            >
              Todas
            </button>
            <button
              className={`font-semibold text-sm cursor-pointer whitespace-nowrap transition ${
                mostrarSemEtapa ? "text-primary border-b-2 border-primary" : "text-muted hover:text-primary"
              }`}
              onClick={() => setMostrarSemEtapa((prev) => !prev)}
            >
              Sem Etapa
            </button>
            {etapas.map((etapa) => (
              <button
                key={etapa.id}
                className={`font-semibold text-sm cursor-pointer whitespace-nowrap transition ${
                  etapaSelecionadaIds.has(etapa.id)
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted hover:text-primary"
                }`}
                onClick={() => handleEtapaClick(etapa.id, false)}
              >
                {etapa.titulo}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <p className="text-xs text-muted font-semibold uppercase">Tarefas de:</p>
              <p className="text-main text-md font-bold">
                {filtrosAtivos === 0 ? "Todas as tarefas" : `${filtrosAtivos} filtro(s) aplicado(s)`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalTarefaOpen(true)}
              className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:brightness-110 transition whitespace-nowrap"
            >
              + Nova Tarefa
            </button>
          </div>

          <div className="mt-4 max-h-[680px] overflow-y-auto pr-1">
            {loadingTarefas ? (
              <LoadingTarefasSkeleton />
            ) : tarefasFiltradas.length > 0 ? (
              <div className="space-y-3">
                {tarefasFiltradas.map((tarefa) => (
                  <CardTarefa
                    key={tarefa.id}
                    tarefa={tarefa}
                    titulo={tarefa.titulo}
                    descricao={tarefa.descricao || "Sem descricao"}
                    prioridade={tarefa.prioridade.toLowerCase() as "baixa" | "media" | "alta"}
                    dataVencimento={tarefa.conclusaoPrazo || ""}
                    responsaveis={[tarefa.criador?.nome || "Sem responsavel"]}
                    onDelete={() => handleDeleteTarefa(tarefa.id)}
                    onEditSuccess={() => handleModalSuccess()}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center py-8">
                <p className="text-muted">Nenhuma tarefa encontrada</p>
              </div>
            )}
          </div>
        </section>

        <aside className="bg-white border border-default rounded-xl p-4 sm:p-5 h-fit">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <Titulo tamanho="text-lg">Etapas do Processo</Titulo>
            <button
              type="button"
              onClick={() => setIsModalEtapaOpen(true)}
              className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:brightness-110 transition"
            >
              + Nova Etapa
            </button>
          </div>

          {filtrosAtivos > 0 && (
            <p className="text-xs text-blue font-semibold mt-2">{filtrosAtivos} filtro(s) selecionado(s)</p>
          )}

          <div className="mt-5 space-y-3">
            {etapas && etapas.length > 0 ? (
              etapas.map((etapa, indice) => (
                <CardEtapa
                  key={etapa.id}
                  etapa={{
                    ...etapa,
                    porcentagemConclusao: porcentagemEtapaMap.get(etapa.id) ?? etapa.porcentagemConclusao,
                  }}
                  indice={indice}
                  isSelected={etapaSelecionadaIds.has(etapa.id)}
                  onClick={handleEtapaClick}
                  idDemanda={id || ""}
                  onEtapaAtualizada={handleModalSuccess}
                />
              ))
            ) : (
              <p className="text-xs text-muted text-center py-4">Nenhuma etapa cadastrada</p>
            )}
          </div>

          <p className="text-[11px] text-muted mt-4">Demanda ID: {id}</p>
        </aside>
      </div>

      <CadastroEtapa
        isOpen={isModalEtapaOpen}
        idDemanda={id || ""}
        onClose={handleModalEtapaClose}
        onSuccess={handleModalSuccess}
      />

      <CadastroTarefa
        isOpen={isModalTarefaOpen}
        onClose={handleModalTarefaClose}
        onSuccess={handleModalSuccess}
        demandaIdPadrao={id}
        contexto="demanda"
      />
    </div>
  );
};

export default DemandaDetalhes;
