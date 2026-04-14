import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Titulo from "../components/Titulo";
import { useTarefa } from "../Hooks/useTarefa";
import download from "../assets/icon-download.svg";
import CardTarefa from "../components/CardTarefa";
import CadastroEtapa from "../components/modals/Etapa/CadastroEtapa";
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
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as DemandaDetalheState | null;
  const demanda = state?.demanda;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etapaSelecionadaId, setEtapaSelecionadaId] = useState<string | null>(null);
  const { etapas, buscarEtapas } = useEtapas(id || "");

  const nomeCliente = demanda?.clienteDto?.nome || "Cliente não informado";
  const tituloDemanda = demanda?.titulo || "Demanda";
  const prazoDemanda = demanda?.conclusaoPrazo || "";
  const responsavelPrincipal =
    demanda?.responsavelList?.[0]?.nome ||
    demanda?.responsavelList?.[0]?.funcionarioDTO?.nomeCompleto ||
    "Sem atribuição";

  const { formatarDataExibicao } = useTarefa(prazoDemanda);

  const statusTarefas = ["Todas", "Não Vinculado", "Etapa 1", "Etapa 2", "Etapa 3"];

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    buscarEtapas();
  };

  const handleEtapaClick = (etapaId: string) => {
    setEtapaSelecionadaId(etapaSelecionadaId === etapaId ? null : etapaId);
  };

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
            {statusTarefas.map((status) => (
              <button
                key={status}
                className="text-muted font-semibold text-sm cursor-pointer whitespace-nowrap"
              >
                {status}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-3 ">
            <div>
              <p className="text-xs text-muted font-semibold uppercase">Tarefas de:</p>
              <p className="text-main text-md font-bold">
                {etapaSelecionadaId
                  ? etapas.find((e) => e.id === etapaSelecionadaId)?.titulo || "Coleta de Documentos"
                  : "Coleta de Documentos"}
              </p>
            </div>
            <button className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:brightness-110 transition whitespace-nowrap">
              + Nova Tarefa
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <CardTarefa />
            <CardTarefa />
            <CardTarefa />
          </div>
        </section>

        <aside className="bg-white border border-default rounded-xl p-4 sm:p-5 h-fit">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 ">
            <Titulo tamanho="text-lg">Etapas do Processo</Titulo>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:brightness-110 transition"
            >
              + Nova Etapa
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {etapas && etapas.length > 0 ? (
              etapas.map((etapa, indice) => (
                <article
                  key={etapa.id}
                  onClick={() => handleEtapaClick(etapa.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    etapaSelecionadaId === etapa.id
                      ? "border-blue border-2 shadow-md bg-blue/5"
                      : etapa.porcentagemConclusao > 0
                      ? "border-blue hover:border-blue/60"
                      : "border-default hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-main font-bold">
                        {indice + 1}. {etapa.titulo}
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        Prazo:{" "}
                        {etapa.conclusaoPrazo
                          ? new Date(etapa.conclusaoPrazo).toLocaleDateString("pt-BR")
                          : "Sem prazo"}
                      </p>
                    </div>
                    <span className="text-xs text-muted font-semibold">{etapa.porcentagemConclusao}%</span>
                  </div>
                  <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue rounded-full"
                      style={{ width: `${etapa.porcentagemConclusao}%` }}
                    />
                  </div>
                </article>
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
        isOpen={isModalOpen}
        idDemanda={id || ""}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default DemandaDetalhes;