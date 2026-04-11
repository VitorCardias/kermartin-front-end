import { useCallback } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import { useListaPaginada, type ResultadoBusca, type FiltrosListagem } from "./useListagem";
import { converterDataTimeLocalParaISO } from "../types/TiposDemandas";

export type DemandaAPI = {
  id: string;
  criador: { id: string };
  responsavelList?: Array<{
    id?: string;
    funcionarioId?: string;
    funcionarioDTO?: { id?: string };
  }>;
  clienteDto?: {
    id: string;
    nome?: string;
  };
  titulo: string;
  descricao: string | null;
  prioridadeDemanda: string;
  statusDemanda: string;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  porcentagemConclusao: number;
};

export type Demanda = DemandaAPI & {
  escritorioId?: string;
};

export type FiltrosDemandaAvancados = {
  busca?: string;
  status?: string[];
  prioridade?: string[];
  funcionariosIds?: string[];
  clientesIds?: string[];
  dataInicio?: string;
  dataFim?: string;
};

const normalizarTexto = (valor?: string) =>
  (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const useDemandas = () => {
  const perfil = usePerfil();
  const demandaTemFuncionarioSelecionado = (demanda: DemandaAPI, funcionariosIds: string[]) => {
    const idsResponsaveis = (demanda.responsavelList || []).flatMap((responsavel) => [
      responsavel.id,
      responsavel.funcionarioId,
      responsavel.funcionarioDTO?.id,
    ]).filter(Boolean) as string[];

    if (idsResponsaveis.length > 0) {
      return funcionariosIds.some((id) => idsResponsaveis.includes(id));
    }

    return funcionariosIds.includes(demanda.criador.id);
  };

  const buscarDemandasFn = useCallback(
    async (pagina: number, filtros: FiltrosListagem, limite: number): Promise<ResultadoBusca<Demanda>> => {
      try {
        const filtrosDemanda = filtros as FiltrosDemandaAvancados;

        const response = await authApi.get(`/demanda`);

        let todasAsDemandas: DemandaAPI[] = [];

        if (Array.isArray(response.data)) {
          todasAsDemandas = response.data;
        } else if (response.data?.content && Array.isArray(response.data.content)) {
          todasAsDemandas = response.data.content;
        }

        let demandasFiltradas = todasAsDemandas;

        if (filtrosDemanda.busca) {
          const busca = normalizarTexto(filtrosDemanda.busca);
          demandasFiltradas = demandasFiltradas.filter((d) =>
            normalizarTexto(d.titulo).includes(busca) ||
            normalizarTexto(d.descricao || "").includes(busca) ||
            normalizarTexto(d.clienteDto?.nome || "").includes(busca)
          );
        }

        if (filtrosDemanda.status && filtrosDemanda.status.length > 0) {
          demandasFiltradas = demandasFiltradas.filter((d) =>
            filtrosDemanda.status!.includes(d.statusDemanda)
          );
        }

        if (filtrosDemanda.prioridade && filtrosDemanda.prioridade.length > 0) {
          demandasFiltradas = demandasFiltradas.filter((d) =>
            filtrosDemanda.prioridade!.includes(d.prioridadeDemanda)
          );
        }

        if (filtrosDemanda.clientesIds && filtrosDemanda.clientesIds.length > 0) {
          demandasFiltradas = demandasFiltradas.filter(
            (d) => d.clienteDto && filtrosDemanda.clientesIds!.includes(d.clienteDto.id)
          );
        }

        if (filtrosDemanda.funcionariosIds && filtrosDemanda.funcionariosIds.length > 0) {
          demandasFiltradas = demandasFiltradas.filter((d) =>
            demandaTemFuncionarioSelecionado(d, filtrosDemanda.funcionariosIds!)
          );
        }

        const totalPaginas = Math.ceil(demandasFiltradas.length / limite);
        const inicio = pagina * limite;
        const fim = inicio + limite;
        const demandasPaginadas = demandasFiltradas.slice(inicio, fim);

        const demandasFormatadas: Demanda[] = demandasPaginadas.map((demanda) => ({
          ...demanda,
          escritorioId: demanda.criador.id,
        }));

        return {
          content: demandasFormatadas,
          totalPages: totalPaginas,
          number: pagina,
        };
      } catch (error) {
        console.error("Erro ao buscar demandas:", error);
        return { content: [], totalPages: 0, number: 0 };
      }
    },
    []
  );

  const {
    itens: demandas,
    loading,
    paginaAtual,
    totalPaginas,
    filtros,
    erro,
    atualizarFiltro,
    irParaPagina,
    irProxima,
    irAnterior,
    recarregar,
  } = useListaPaginada(buscarDemandasFn, {
    itensPorPagina: 10,
    filtrosIniciais: {},
  });

  const atualizarFiltrosAvancados = useCallback(
    (novosFiltros: Partial<FiltrosDemandaAvancados>) => {
      atualizarFiltro(novosFiltros);
    },
    [atualizarFiltro]
  );

  const limparFiltros = useCallback(() => {
    atualizarFiltro({
      busca: undefined,
      status: undefined,
      prioridade: undefined,
      funcionariosIds: undefined,
      clientesIds: undefined,
      dataInicio: undefined,
      dataFim: undefined,
    });
  }, [atualizarFiltro]);

  const cadastrarDemanda = async (
    novaDemandaData: Omit<Demanda, "id" | "criador">
  ): Promise<Demanda | null> => {
    try {
      if (!perfil?.idEscritorio) {
        console.error("Erro: Perfil do usuario nao encontrado para cadastro.");
        return null;
      }

      const payload = {
        criador: { id: perfil.idEscritorio },
        ...novaDemandaData,
      };

      const response = await authApi.post<DemandaAPI>("/demanda", payload);

      if (response.data?.id) {
        recarregar();
        return { ...response.data, escritorioId: response.data.criador.id };
      }

      return null;
    } catch (error) {
      console.error("Erro ao cadastrar demanda:", error);
      return null;
    }
  };

  const editarDemanda = async (demandaEditada: Demanda): Promise<Demanda | null> => {
    try {
      const demandaEditadaPayload: any = {
        ...demandaEditada,
        inicioPrazo: demandaEditada.inicioPrazo
          ? converterDataTimeLocalParaISO(demandaEditada.inicioPrazo)
          : null,
        conclusaoPrazo: demandaEditada.conclusaoPrazo
          ? converterDataTimeLocalParaISO(demandaEditada.conclusaoPrazo)
          : null,
      };

      const response = await authApi.put<DemandaAPI>("/demanda", demandaEditadaPayload);

      if (response.data?.id) {
        recarregar();
        return { ...response.data, escritorioId: response.data.criador.id };
      }

      return null;
    } catch (error) {
      console.error("Erro ao editar demanda:", error);
      return null;
    }
  };

  const deletarDemanda = async (demandaParaDeletar: Demanda | string) => {
    try {
      const demandaId =
        typeof demandaParaDeletar === "string" ? demandaParaDeletar : demandaParaDeletar.id;

      await authApi.delete(`/demanda/${demandaId}`);
      recarregar();
      return true;
    } catch (error) {
      console.error("Erro ao deletar demanda:", error);
      return null;
    }
  };

  return {
    demandas,
    loading,
    paginaAtual,
    setPaginaAtual: irParaPagina,
    totalPaginas,
    itensPorPagina: 10,
    filtros: filtros as FiltrosDemandaAvancados,
    erro,
    atualizarFiltro,
    irProxima,
    irAnterior,
    irParaPagina,
    recarregar,
    buscarDemandas: recarregar,
    atualizarFiltrosAvancados,
    limparFiltros,
    cadastrarDemanda,
    editarDemanda,
    deletarDemanda,
  };
};

