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
  };

  return mapa[status || ""] || "EM ANDAMENTO";
};

const DemandaDetalhes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as DemandaDetalheState | null;
  const demanda = state?.demanda;

  const [isModalEtapaOpen, setIsModalEtapaOpen] = useState(false);
  const [isModalTarefaOpen, setIsModalTarefaOpen] = useState(false);
  const [etapaSelecionadaIds, setEtapaSelecionadaIds] = useState<Set<string>>(new Set());
  
  const { etapas, buscarEtapas } = useEtapas(id || "");
  const { tarefas, buscarTarefas, formatarDataExibicao, loading: loadingTarefas, deletarTarefa } = useTarefa();

  const nomeCliente = demanda?.clienteDto?.nome || "Cliente não informado";
  const tituloDemanda = demanda?.titulo || "Demanda";
  const prazoDemanda = demanda?.conclusaoPrazo || "";
  const responsavelPrincipal =
    demanda?.responsavelList?.[0]?.nome ||
    demanda?.responsavelList?.[0]?.funcionarioDTO?.nomeCompleto ||
    "Sem atribuição";

  // Buscar tarefas ao montar o componente ou quando o ID mudar
  useEffect(() => {
    if (id) {
      buscarTarefas("demanda", id);
    }
  }, [id]);

  // Filtrar tarefas da etapa selecionada
  const tarefasFiltradas = etapaSelecionadaIds.size > 0
    ? tarefas.filter((tarefa) => {
        const etapaId = [...etapaSelecionadaIds][0];
        return tarefa.etapaDemandaDTO?.id === etapaId;
      })
    : tarefas;

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

  const handleEtapaClick = (etapaId: string, isMultiple: boolean) => {
    setEtapaSelecionadaIds((prevIds) => {
      const novoSet = new Set(prevIds);
      
      if (isMultiple) {
        // Seleção múltipla com Ctrl/Cmd
        if (novoSet.has(etapaId)) {
          novoSet.delete(etapaId);
        } else {
          novoSet.add(etapaId);
        }
      } else {
        // Seleção única (clique normal)
        if (novoSet.has(etapaId)) {
          novoSet.delete(etapaId);
        } else {
          novoSet.clear();
          novoSet.add(etapaId);
        }
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

  const etapaSelecionada = etapaSelecionadaIds.size > 0
    ? etapas.find((e) => e.id === [...etapaSelecionadaIds][0])
    : null;

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
          <span className="inline-flex mt-5 bg-status-inprogress text-status-inprogress px-3 py-1 rounded text-xs font-semibold w-full">
            {statusLabel(demanda?.statusDemanda)}
          </span>

          <Titulo tamanho="text-lg mt-4">{tituloDemanda}</Titulo>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">CLIENTE:</p>
              <p className="text-main text-md font-semibold">{nomeCliente}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">RESPONSÁVEL:</p>
              <p className="text-main text-md font-semibold">{responsavelPrincipal}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">PRAZO FINAL:</p>
              <p className="text-main text-md font-semibold">
                {prazoDemanda ? formatarDataExibicao(prazoDemanda) : "Sem prazo"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-muted">DESCRIÇÃO:</p>
              <p className="text-main text-md font-semibold">{demanda?.descricao || "Descrição não informada"}</p>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-8 bg-primary text-white text-xs font-semibold py-2.5 rounded-lg hover:brightness-110 transition cursor-pointer"
          >
            EMITIR RELATÓRIO
            <img src={download} alt="Ícone de download" className="inline-block w-3 h-3 ml-2" />
          </button>
        </aside>

        <section className="bg-white border border-default rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-6 border-b border-default pb-3 overflow-x-auto no-scrollbar">
            <button
              className="text-muted font-semibold text-sm cursor-pointer whitespace-nowrap hover:text-primary transition"
              onClick={() => setEtapaSelecionadaIds(new Set())}
            >
              Todas
            </button>
            {etapas.map((etapa) => (
              <button
                key={etapa.id}
                className={`font-semibold text-sm cursor-pointer whitespace-nowrap transition ${
                  etapaSelecionadaIds.has(etapa.id)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
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
                {etapaSelecionada?.titulo || "Todas as tarefas"}
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

          <div className="mt-4 space-y-3">
            {loadingTarefas ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-muted">Carregando tarefas...</p>
              </div>
            ) : tarefasFiltradas.length > 0 ? (
              tarefasFiltradas.map((tarefa) => (
                <CardTarefa
                  key={tarefa.id}
                  tarefa={tarefa}
                  titulo={tarefa.titulo}
                  descricao={tarefa.descricao || "Sem descrição"}
                  prioridade={tarefa.prioridade.toLowerCase() as 'baixa' | 'media' | 'alta'}
                  dataVencimento={formatarDataExibicao(tarefa.conclusaoPrazo)}
                  responsaveis={[tarefa.criador?.nome || "Sem responsável"]}
                  onDelete={() => handleDeleteTarefa(tarefa.id)}
                  onEditSuccess={() => handleModalSuccess()}
                />
              ))
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

          {etapaSelecionadaIds.size > 0 && (
            <p className="text-xs text-blue font-semibold mt-2">
              {etapaSelecionadaIds.size} etapa(s) selecionada(s)
            </p>
          )}

          <div className="mt-5 space-y-3">
            {etapas && etapas.length > 0 ? (
              etapas.map((etapa, indice) => (
                <CardEtapa
                  key={etapa.id}
                  etapa={etapa}
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

      {/* Modal de Cadastro de Etapa */}
      <CadastroEtapa
        isOpen={isModalEtapaOpen}
        idDemanda={id || ""}
        onClose={handleModalEtapaClose}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de Cadastro de Tarefa */}
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