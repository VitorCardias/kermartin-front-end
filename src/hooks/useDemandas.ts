import { useCallback } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import { useListaPaginada, type ResultadoBusca, type FiltrosListagem } from "./useListagem";
import { converterDataTimeLocalParaISO } from "../types/TiposDemandas";
import { cacheService } from "../utils/cacheService";

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

const parseDataDemanda = (valor?: string | null): Date | null => {
  if (!valor) return null;

  const texto = valor.trim();
  if (!texto) return null;

  if (texto.includes("T")) {
    const dataIso = new Date(texto);
    return isNaN(dataIso.getTime()) ? null : dataIso;
  }

  if (texto.includes(" ")) {
    const [dataParte, horaParte] = texto.split(" ");
    if (dataParte?.includes("-")) {
      const [dia, mes, ano] = dataParte.split("-");
      const [hora = "00", minuto = "00", segundo = "00"] = (horaParte || "").split(":");
      const data = new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
      );
      return isNaN(data.getTime()) ? null : data;
    }
  }

  const fallback = new Date(texto);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const statusDemandaFinalizado = (status?: string | null) => {
  const normalizado = normalizarTexto(status || "");
  return normalizado.includes("finalizada") || normalizado.includes("finalizado");
};

export const useDemandas = () => {
  const perfil = usePerfil();
  const cacheKeyDemandas = `demandas:listagem:${perfil?.idEscritorio || "sem-escritorio"}`;

  const invalidarCacheDemandas = useCallback(() => {
    cacheService.clear(cacheKeyDemandas);
  }, [cacheKeyDemandas]);

  const buscarDemandasFn = useCallback(
    async (pagina: number, filtros: FiltrosListagem, limite: number): Promise<ResultadoBusca<Demanda>> => {
      try {
        const filtrosDemanda = filtros as FiltrosDemandaAvancados;
        const isFuncionario = perfil?.tipoUsuario === "Funcionario";
        const filtrosFuncionariosEfetivos =
          isFuncionario && perfil?.id ? [perfil.id] : (filtrosDemanda.funcionariosIds || []);

        const todasAsDemandas = await cacheService.fetch<DemandaAPI[]>(
          cacheKeyDemandas,
          async () => {
            const response = await authApi.get(`/demanda`);

            if (Array.isArray(response.data)) {
              return response.data;
            }

            if (response.data?.content && Array.isArray(response.data.content)) {
              return response.data.content;
            }

            return [];
          },
          30 * 1000
        );

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

        if (filtrosFuncionariosEfetivos.length > 0) {
          const funcionariosSelecionados = filtrosFuncionariosEfetivos;

          const demandasComEquipe = await Promise.all(
            demandasFiltradas.map(async (demanda) => {
              const idsRelacionados = new Set<string>();

              const idsResponsaveis = (demanda.responsavelList || [])
                .flatMap((responsavel) => [
                  responsavel.id,
                  responsavel.funcionarioId,
                  responsavel.funcionarioDTO?.id,
                ])
                .filter(Boolean) as string[];

              idsResponsaveis.forEach((id) => idsRelacionados.add(id));

              // Se a API de demanda nao trouxer responsavelList completo, consulta a equipe da demanda.
              if (idsRelacionados.size === 0) {
                try {
                  const equipeResponse = await authApi.get(
                    `/membro-equipe-demanda/listar-todos-por-demanda/${demanda.id}`,
                    { params: { page: 0, size: 100 } }
                  );

                  const membrosEquipe = Array.isArray(equipeResponse.data)
                    ? equipeResponse.data
                    : Array.isArray(equipeResponse.data?.content)
                      ? equipeResponse.data.content
                      : [];

                  membrosEquipe.forEach((membro: any) => {
                    const idFuncionario = membro?.funcionarioDTO?.id;
                    if (idFuncionario) idsRelacionados.add(idFuncionario);
                  });
                } catch {
                  // Se falhar consulta da equipe, mantem fallback local.
                }
              }

              return {
                demanda,
                possuiFuncionarioSelecionado: funcionariosSelecionados.some((id) => idsRelacionados.has(id)),
              };
            })
          );

          demandasFiltradas = demandasComEquipe
            .filter((item) => item.possuiFuncionarioSelecionado)
            .map((item) => item.demanda);
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        demandasFiltradas.sort((a, b) => {
          const dataA = parseDataDemanda(a.conclusaoPrazo);
          const dataB = parseDataDemanda(b.conclusaoPrazo);
          const finalizadaA = statusDemandaFinalizado(a.statusDemanda);
          const finalizadaB = statusDemandaFinalizado(b.statusDemanda);

          const categoriaA = finalizadaA ? 3 : !dataA ? 2 : dataA < hoje ? 0 : 1;
          const categoriaB = finalizadaB ? 3 : !dataB ? 2 : dataB < hoje ? 0 : 1;

          if (categoriaA !== categoriaB) return categoriaA - categoriaB;

          if (categoriaA === 0 && dataA && dataB) {
            // Vencidas primeiro, mas prioriza as mais proximas do hoje.
            return dataB.getTime() - dataA.getTime();
          }

          if (categoriaA === 3) {
            return a.titulo.localeCompare(b.titulo);
          }

          if (!dataA && !dataB) return a.titulo.localeCompare(b.titulo);
          if (!dataA) return 1;
          if (!dataB) return -1;

          return dataA.getTime() - dataB.getTime();
        });

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
    [cacheKeyDemandas, perfil?.id, perfil?.tipoUsuario]
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
        invalidarCacheDemandas();
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
        titulo: demandaEditada.titulo?.trim(),
        descricao: demandaEditada.descricao?.trim() || null,
        clienteDto: demandaEditada.clienteDto || null,
        criador: demandaEditada.criador?.id ? { id: demandaEditada.criador.id } : demandaEditada.criador,
        porcentagemConclusao: Number(demandaEditada.porcentagemConclusao || 0),
        inicioPrazo: demandaEditada.inicioPrazo
          ? converterDataTimeLocalParaISO(demandaEditada.inicioPrazo)
          : null,
        conclusaoPrazo: demandaEditada.conclusaoPrazo
          ? converterDataTimeLocalParaISO(demandaEditada.conclusaoPrazo)
          : null,
      };

      // Campos locais que não devem ir para o backend
      delete demandaEditadaPayload.escritorioId;
      delete demandaEditadaPayload.responsavelList;

      const response = await authApi.put<DemandaAPI>("/demanda", demandaEditadaPayload);

      if (response.data?.id) {
        invalidarCacheDemandas();
        recarregar();
        return { ...response.data, escritorioId: response.data.criador.id };
      }

      return null;
    } catch (error) {
      console.error("Erro ao editar demanda:", error);
      console.error("Payload enviado na edicao:", {
        ...demandaEditada,
        inicioPrazo: demandaEditada.inicioPrazo
          ? converterDataTimeLocalParaISO(demandaEditada.inicioPrazo)
          : null,
        conclusaoPrazo: demandaEditada.conclusaoPrazo
          ? converterDataTimeLocalParaISO(demandaEditada.conclusaoPrazo)
          : null,
      });
      throw error;
    }
  };

  const deletarDemanda = async (demandaParaDeletar: Demanda | string) => {
    try {
      const demandaId =
        typeof demandaParaDeletar === "string" ? demandaParaDeletar : demandaParaDeletar.id;

      await authApi.delete(`/demanda/${demandaId}`);
      invalidarCacheDemandas();
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
