import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import Titulo from "../components/Titulo";
import CardDemanda from "../components/CardDemanda";
import CadastroDemanda from "../components/modals/Demanda/CadastroDemanda";
import EditarDemanda from "../components/modals/Demanda/EditarDemanda";
import Paginacao from "../components/Paginacao";
import FiltrosAvancadosDemanda from "../components/modals/Demanda/FiltrosAvancadosDemanda";
import { useDemandas, type FiltrosDemandaAvancados } from "../Hooks/useDemandas";
import StatusFiltro from "../components/StatusFiltro";
import { authApi } from "../api/AuthService";
import { usePerfil } from "../Hooks/usePerfil";

const Demandas: React.FC = () => {
  const location = useLocation();
  const perfil = usePerfil();
  const isFuncionario = perfil?.tipoUsuario === "Funcionario";
  const {
    demandas,
    loading,
    paginaAtual,
    totalPaginas,
    filtros,
    atualizarFiltrosAvancados,
    limparFiltros,
    irProxima,
    irAnterior,
    irParaPagina,
  } = useDemandas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [demandaSelecionada, setDemandaSelecionada] = useState<any>(null);
  const [demandasLocais, setDemandasLocais] = useState(demandas);
  const [filtroInicialAplicado, setFiltroInicialAplicado] = useState(false);
  const [responsaveisPorDemanda, setResponsaveisPorDemanda] = useState<Record<string, string[]>>({});
  const cacheResponsaveisRef = React.useRef<Record<string, string[]>>({});

  React.useEffect(() => {
    setDemandasLocais(demandas);
  }, [demandas]);

  React.useEffect(() => {
    if (!demandas.length) return;

    const nomesLocais: Record<string, string[]> = {};

    demandas.forEach((demanda) => {
      const nomes = Array.from(
        new Set(
          (demanda.responsavelList || [])
            .map((r: any) => r?.nome || r?.funcionarioDTO?.nomeCompleto)
            .filter((nome: string | undefined) => Boolean(nome?.trim()))
        )
      );

      if (nomes.length > 0) {
        nomesLocais[demanda.id] = nomes;
        cacheResponsaveisRef.current[demanda.id] = nomes;
      }
    });

    if (Object.keys(nomesLocais).length > 0) {
      setResponsaveisPorDemanda((prev) => ({ ...prev, ...nomesLocais }));
    }

    const idsSemCache = demandas.map((demanda) => demanda.id).filter((id) => !cacheResponsaveisRef.current[id]);
    if (idsSemCache.length === 0) return;

    const carregarResponsaveis = async () => {
      const resultados = await Promise.allSettled(
        idsSemCache.map(async (id) => {
          const response = await authApi.get(`/membro-equipe-demanda/listar-todos-por-demanda/${id}`, {
            params: { page: 0, size: 50 },
          });

          const membros = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.content)
              ? response.data.content
              : [];

          const nomes: string[] = Array.from(
            new Set(
              membros
                .map((membro: any) => membro?.funcionarioDTO?.nomeCompleto)
                .filter((nome: unknown): nome is string => typeof nome === "string" && nome.trim().length > 0)
            )
          );

          return { id, nomes };
        })
      );

      const atualizado: Record<string, string[]> = {};
      resultados.forEach((resultado) => {
        if (resultado.status !== "fulfilled") return;
        const { id, nomes } = resultado.value;
        const fallback = cacheResponsaveisRef.current[id] || [];
        atualizado[id] = nomes.length > 0 ? nomes : fallback;
        cacheResponsaveisRef.current[id] = atualizado[id];
      });

      if (Object.keys(atualizado).length > 0) {
        setResponsaveisPorDemanda((prev) => ({ ...prev, ...atualizado }));
      }
    };

    carregarResponsaveis();
  }, [demandas]);

  React.useEffect(() => {
    if (filtroInicialAplicado) return;

    const filtroInicial = (location.state as any)?.filtroInicial as Partial<FiltrosDemandaAvancados> | undefined;
    if (!filtroInicial) {
      setFiltroInicialAplicado(true);
      return;
    }

    atualizarFiltrosAvancados(filtroInicial);
    setFiltroInicialAplicado(true);
  }, [location.state, filtroInicialAplicado, atualizarFiltrosAvancados]);

  const mapearStatusParaDisplay = (status: string): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
    const mapa: Record<string, 'aguardando' | 'andamento' | 'finalizado' | 'atrasada'> = {
      RequerindoEquipe: 'aguardando',
      EmAndamento: 'andamento',
      Finalizada: 'finalizado',
      Atrasada: 'atrasada',
    };
    return mapa[status] || 'aguardando';
  };

  const mapearPrioridadeParaDisplay = (prioridade: string): 'baixa' | 'media' | 'alta' => {
    const mapa: Record<string, 'baixa' | 'media' | 'alta'> = {
      Alta: 'alta',
      Media: 'media',
      Baixa: 'baixa',
    };
    return mapa[prioridade] || 'baixa';
  };

  const handleAtualizarFiltros = useCallback((novosFiltros: Partial<FiltrosDemandaAvancados>) => {
    atualizarFiltrosAvancados(novosFiltros);
  }, [atualizarFiltrosAvancados]);

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.busca) count++;
    if (filtros.status?.length) count += filtros.status.length;
    if (filtros.prioridade?.length) count += filtros.prioridade.length;
    if (filtros.clientesIds?.length) count += filtros.clientesIds.length;
    if (!isFuncionario && filtros.funcionariosIds?.length) count += filtros.funcionariosIds.length;
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
            <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Demandas</Titulo>
            <p className="text-muted text-xs sm:text-sm">
              {demandasLocais.length > 0
                ? `Exibindo ${demandasLocais.length} demandas${
                    contarFiltrosAtivos() > 0 ? ` (${contarFiltrosAtivos()} filtro(s) ativo(s))` : ''
                  }`
                : 'Nenhuma demanda encontrada'}
            </p>
          </div>
          <button
            className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Cadastrar Demanda
          </button>
        </div>
        <div className="w-full sm:w-4/5">
          <FiltrosAvancadosDemanda
            filtrosAtivos={filtros}
            onAtualizarFiltros={handleAtualizarFiltros}
            onLimparFiltros={limparFiltros}
            ocultarFiltroFuncionarios={isFuncionario}
          />
        </div>
                <StatusFiltro
          opcoes={[
            { label: "Em Andamento", value: "EmAndamento" },
            { label: "Aguardando", value: "RequerindoEquipe" },
            { label: "Finalizada", value: "Finalizada" },
            { label: "Atrasada", value: "Atrasada" },
          ]}
          valorAtivo={filtros.status?.[0]}
          onChange={(status) => handleAtualizarFiltros({ status: status ? [status] : undefined })}
          labelTodos="Todas"
        />
        <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center">
          {loading ? (
            <LoadingCards />
          ) : demandasLocais.length === 0 ? (
            <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-muted text-sm sm:text-base">
                {contarFiltrosAtivos() > 0
                  ? "Nenhuma demanda encontrada com os filtros selecionados"
                  : "Nenhuma demanda cadastrada ainda"}
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4 items-center justify-center">
              {demandasLocais.map((demanda) => (
                <CardDemanda
                  key={demanda.id}
                  titulo={demanda.titulo}
                  cliente={demanda.clienteDto?.nome || "Sem cliente"}
                  prioridade={mapearPrioridadeParaDisplay(demanda.prioridadeDemanda)}
                  status={mapearStatusParaDisplay(demanda.statusDemanda)}
                  dataVencimento={demanda.conclusaoPrazo || "Sem data"}
                  responsaveis={responsaveisPorDemanda[demanda.id] || []}
                  demanda={demanda}
                  onEdit={(demandaEditando) => {
                    setDemandaSelecionada(demandaEditando);
                    setIsEditModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && demandasLocais.length > 0 && (
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

      <CadastroDemanda
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />

      <EditarDemanda
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setDemandaSelecionada(null);
        }}
        demanda={demandaSelecionada}
        onSuccess={(demandaAtualizada, acao) => {
          setIsEditModalOpen(false);
          setDemandaSelecionada(null);

          if (acao === 'excluir' && demandaAtualizada) {
            setDemandasLocais((prev) => prev.filter((d) => d.id !== demandaAtualizada.id));
          } else if (acao === 'editar' && demandaAtualizada) {
            setDemandasLocais((prev) =>
              prev.map((d) => (d.id === demandaAtualizada.id ? { ...d, ...demandaAtualizada } : d))
            );
          }
        }}
      />
    </>
  );
};

export default Demandas;
