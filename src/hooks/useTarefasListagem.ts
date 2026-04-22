import { useCallback, useState } from "react";
import { authApi } from "../api/AuthService";
import { useListaPaginada, type FiltrosListagem, type ResultadoBusca } from "./useListagem";
import { type TarefaAPI } from "./useTarefa";
import { cacheService } from "../utils/cacheService";
import { usePerfil } from "./usePerfil";

type DemandaBasica = {
  id: string;
  titulo: string;
  clienteDto?: {
    id: string;
    nome?: string;
  } | null;
};

export type TarefaListagem = TarefaAPI & {
  demandaTitulo?: string;
  clienteId?: string;
  clienteNome?: string;
  funcionarioId?: string;
};

export type FiltrosTarefaAvancados = {
  busca?: string;
  status?: string[];
  prioridade?: string[];
  demandasIds?: string[];
  clientesIds?: string[];
  funcionariosIds?: string[];
};

const normalizarTexto = (valor?: string | null) =>
  (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const parseData = (valor?: string | null): Date | null => {
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
      const partes = dataParte.split("-");
      if (partes.length === 3) {
        let dia = "01";
        let mes = "01";
        let ano = "1970";

        if (partes[0].length === 4) {
          [ano, mes, dia] = partes;
        } else {
          [dia, mes, ano] = partes;
        }

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
  }

  const fallback = new Date(texto);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const statusFinalizado = (status?: string | null) => {
  const normalizado = normalizarTexto(status || "");
  return normalizado.includes("finalizada") || normalizado.includes("finalizado");
};

const extrairLista = <T,>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (payload?.content && Array.isArray(payload.content)) return payload.content;
  return [];
};

export const useTarefasListagem = () => {
  const perfil = usePerfil();
  const [demandasParaFiltro, setDemandasParaFiltro] = useState<Array<{ id: string; titulo: string }>>([]);
  const cacheKeyDemandas = `tarefas:listagem:demandas:${perfil?.idEscritorio || "sem-escritorio"}`;
  const cacheKeyTarefas = `tarefas:listagem:itens:${perfil?.idEscritorio || "sem-escritorio"}`;

  const buscarTarefasFn = useCallback(
    async (
      pagina: number,
      filtros: FiltrosListagem,
      limite: number
    ): Promise<ResultadoBusca<TarefaListagem>> => {
      try {
        const filtrosTarefa = filtros as FiltrosTarefaAvancados;
        const isFuncionario = perfil?.tipoUsuario === "Funcionario";
        const filtrosFuncionariosEfetivos =
          isFuncionario && perfil?.id ? [perfil.id] : (filtrosTarefa.funcionariosIds || []);

        const todasDemandas = await cacheService.fetch<DemandaBasica[]>(
          cacheKeyDemandas,
          async () => {
            const demandasResponse = await authApi.get("/demanda");
            return extrairLista<DemandaBasica>(demandasResponse.data);
          },
          30 * 1000
        );

        setDemandasParaFiltro(
          todasDemandas.map((demanda) => ({
            id: demanda.id,
            titulo: demanda.titulo,
          }))
        );

        const mapaDemandas = new Map(todasDemandas.map((d) => [d.id, d]));

        const tarefasBrutas = await cacheService.fetch<TarefaAPI[]>(
          cacheKeyTarefas,
          async () => {
            let tarefasColetadas: TarefaAPI[] = [];

            try {
              const tarefasResponse = await authApi.get("/tarefa-etapa", {
                params: { page: 0, size: 200 },
              });

              if (Array.isArray(tarefasResponse.data)) {
                tarefasColetadas = tarefasResponse.data as TarefaAPI[];
              } else if (tarefasResponse.data?.content && Array.isArray(tarefasResponse.data.content)) {
                const primeiraPagina = tarefasResponse.data.content as TarefaAPI[];
                const totalPages = Number(tarefasResponse.data.totalPages || 1);

                if (totalPages > 1) {
                  const paginasRestantes = await Promise.all(
                    Array.from({ length: totalPages - 1 }, (_, index) =>
                      authApi.get("/tarefa-etapa", {
                        params: { page: index + 1, size: 200 },
                      })
                    )
                  );

                  const outrasTarefas = paginasRestantes.flatMap((response) =>
                    extrairLista<TarefaAPI>(response.data)
                  );

                  tarefasColetadas = [...primeiraPagina, ...outrasTarefas];
                } else {
                  tarefasColetadas = primeiraPagina;
                }
              }
            } catch {
              const respostasPorDemanda = await Promise.all(
                todasDemandas.map(async (demanda) => {
                  try {
                    const response = await authApi.get(`/tarefa-etapa/demanda/${demanda.id}`, {
                      params: { page: 0, size: 1000 },
                    });
                    return extrairLista<TarefaAPI>(response.data);
                  } catch {
                    return [];
                  }
                })
              );

              const tarefasFlatten = respostasPorDemanda.flat();
              const mapaPorId = new Map<string, TarefaAPI>();
              tarefasFlatten.forEach((tarefa) => mapaPorId.set(tarefa.id, tarefa));
              tarefasColetadas = Array.from(mapaPorId.values());
            }

            return tarefasColetadas;
          },
          30 * 1000
        );

        let tarefasFiltradas: TarefaListagem[] = tarefasBrutas.map((tarefa) => {
          const demanda = tarefa.demandaDTO?.id ? mapaDemandas.get(tarefa.demandaDTO.id) : undefined;
          return {
            ...tarefa,
            demandaTitulo: demanda?.titulo || tarefa.demandaDTO?.titulo,
            clienteId: demanda?.clienteDto?.id,
            clienteNome: demanda?.clienteDto?.nome,
            funcionarioId: tarefa.criador?.id,
          };
        });

        if (filtrosTarefa.busca) {
          const busca = normalizarTexto(filtrosTarefa.busca);
          tarefasFiltradas = tarefasFiltradas.filter((tarefa) => {
            const campos = [
              tarefa.titulo,
              tarefa.descricao,
              tarefa.demandaTitulo,
              tarefa.clienteNome,
              tarefa.criador?.nome,
            ];

            return campos.some((campo) => normalizarTexto(campo).includes(busca));
          });
        }

        if (filtrosTarefa.status && filtrosTarefa.status.length > 0) {
          tarefasFiltradas = tarefasFiltradas.filter((tarefa) =>
            filtrosTarefa.status!.includes(tarefa.status)
          );
        }

        if (filtrosTarefa.prioridade && filtrosTarefa.prioridade.length > 0) {
          tarefasFiltradas = tarefasFiltradas.filter((tarefa) =>
            filtrosTarefa.prioridade!.some(
              (prioridade) => normalizarTexto(prioridade) === normalizarTexto(tarefa.prioridade)
            )
          );
        }

        if (filtrosTarefa.demandasIds && filtrosTarefa.demandasIds.length > 0) {
          tarefasFiltradas = tarefasFiltradas.filter(
            (tarefa) => !!tarefa.demandaDTO?.id && filtrosTarefa.demandasIds!.includes(tarefa.demandaDTO.id)
          );
        }

        if (filtrosTarefa.clientesIds && filtrosTarefa.clientesIds.length > 0) {
          tarefasFiltradas = tarefasFiltradas.filter(
            (tarefa) => !!tarefa.clienteId && filtrosTarefa.clientesIds!.includes(tarefa.clienteId)
          );
        }

        if (filtrosFuncionariosEfetivos.length > 0) {
          const tarefasComEquipe = await Promise.all(
            tarefasFiltradas.map(async (tarefa) => {
              const idsRelacionados = new Set<string>();

              if (tarefa.funcionarioId) {
                idsRelacionados.add(tarefa.funcionarioId);
              }

              try {
                const equipeResponse = await authApi.get(
                  `/membro-equipe-tarefa/listar-todos-por-tarefa/${tarefa.id}`,
                  {
                    params: { page: 0, size: 100 },
                  }
                );

                const membros = extrairLista<any>(equipeResponse.data);
                membros.forEach((membro) => {
                  const idFuncionario = membro?.funcionarioDTO?.id;
                  if (idFuncionario) idsRelacionados.add(idFuncionario);
                });
              } catch {
                // Nao interrompe o filtro se nao houver equipe para a tarefa.
              }

              return { tarefa, idsRelacionados };
            })
          );

          tarefasFiltradas = tarefasComEquipe
            .filter(({ idsRelacionados }) =>
              filtrosFuncionariosEfetivos.some((id) => idsRelacionados.has(id))
            )
            .map(({ tarefa }) => tarefa);
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        tarefasFiltradas.sort((a, b) => {
          const dataA = parseData(a.conclusaoPrazo);
          const dataB = parseData(b.conclusaoPrazo);
          const finalizadaA = statusFinalizado(a.status);
          const finalizadaB = statusFinalizado(b.status);

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

        const totalPaginas = Math.ceil(tarefasFiltradas.length / limite);
        const inicio = pagina * limite;
        const fim = inicio + limite;

        return {
          content: tarefasFiltradas.slice(inicio, fim),
          totalPages: totalPaginas,
          number: pagina,
        };
      } catch (error) {
        console.error("Erro ao buscar tarefas para listagem:", error);
        return { content: [], totalPages: 0, number: 0 };
      }
    },
    [cacheKeyDemandas, cacheKeyTarefas, perfil?.id, perfil?.tipoUsuario]
  );

  const {
    itens: tarefas,
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
  } = useListaPaginada<TarefaListagem>(buscarTarefasFn, {
    itensPorPagina: 10,
    filtrosIniciais: {},
  });

  const atualizarFiltrosAvancados = useCallback(
    (novosFiltros: Partial<FiltrosTarefaAvancados>) => {
      atualizarFiltro(novosFiltros);
    },
    [atualizarFiltro]
  );

  const limparFiltros = useCallback(() => {
    atualizarFiltro({
      busca: undefined,
      status: undefined,
      prioridade: undefined,
      demandasIds: undefined,
      clientesIds: undefined,
      funcionariosIds: undefined,
    });
  }, [atualizarFiltro]);

  return {
    tarefas,
    loading,
    paginaAtual,
    totalPaginas,
    filtros: filtros as FiltrosTarefaAvancados,
    demandasParaFiltro,
    erro,
    atualizarFiltrosAvancados,
    limparFiltros,
    irProxima,
    irAnterior,
    irParaPagina,
    recarregar,
  };
};
