import { useState } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";
import { cacheService } from "../utils/cacheService";

export type TarefaAPI = {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  porcentagemConclusao: number;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  etapaDemandaDTO?: { id: string; titulo: string } | null;
  demandaDTO?: { id: string; titulo: string } | null;
  criador: { id: string; nome?: string };
};

type PaginacaoResponse = {
  content: TarefaAPI[];
  totalPages: number;
};

export type CreateTarefaPayload = {
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  etapaDemandaDTO?: { id: string } | null;
  demandaDTO?: { id: string } | null;
};

export type UpdateTarefaPayload = Omit<TarefaAPI, "id">;

type TarefaContexto = "etapa" | "demanda" | "funcionario";

export const useTarefa = () => {
  const perfil = usePerfil();
  const [tarefas, setTarefas] = useState<TarefaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const invalidarCacheTarefas = () => {
    const escritorioId = perfil?.idEscritorio || "sem-escritorio";
    cacheService.clear(`tarefas:listagem:itens:${escritorioId}`);
    cacheService.clear(`demandas:listagem:${escritorioId}`);
  };

  const parseData = (valor?: string | null): Date | null => {
    if (!valor) return null;

    const texto = valor.trim();
    if (!texto || texto.toLowerCase().includes("nan")) return null;

    if (texto.includes("T")) {
      const iso = new Date(texto);
      return isNaN(iso.getTime()) ? null : iso;
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

    if (texto.includes("/")) {
      const [dataParte, horaParte] = texto.split(" ");
      const partes = dataParte.split("/");
      if (partes.length === 3) {
        const [dia, mes, ano] = partes;
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

  const formatarDataExibicao = (dataString: string | null | undefined): string => {
    if (!dataString) return "Sem data";

    const date = parseData(dataString);
    if (!date) return "Data invalida";

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const buscarTarefas = async (
    contexto: TarefaContexto,
    id: string
  ): Promise<void> => {
    if (!id) return;

    setLoading(true);
    try {
      let endpoint = "";

      switch (contexto) {
        case "etapa":
          endpoint = `/tarefa-etapa/listar-por-etapa/${id}`;
          break;
        case "demanda":
          endpoint = `/tarefa-etapa/demanda/${id}`;
          break;
        case "funcionario":
          endpoint = `/tarefa-etapa/listar-por-funcionario/${id}`;
          break;
      }

      const response = await authApi.get<PaginacaoResponse>(endpoint, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setTarefas(response.data.content);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error(`Erro ao buscar tarefas (${contexto}):`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cadastrarTarefa = async (novaTarefa: CreateTarefaPayload): Promise<void> => {
    try {
      await authApi.post("/tarefa-etapa", {
        ...novaTarefa,
        criador: { id: perfil?.id },
        porcentagemConclusao: 0,
      });
      invalidarCacheTarefas();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa:", error);
      throw error;
    }
  };

  const editarTarefa = async (
    idTarefa: string,
    tarefaEditada: UpdateTarefaPayload
  ): Promise<void> => {
    try {
      await authApi.put("/tarefa-etapa", {
        id: idTarefa,
        ...tarefaEditada,
      });
      invalidarCacheTarefas();
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      throw error;
    }
  };

  const deletarTarefa = async (idTarefa: string): Promise<void> => {
    try {
      await authApi.delete(`/tarefa-etapa/${idTarefa}`);
      invalidarCacheTarefas();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw error;
    }
  };

  const concluirTarefa = async (idAtribuicaoTarefa: string): Promise<void> => {
    try {
      await authApi.patch(
        `/membro-equipe-tarefa/concluir-tarefa?idAtribuicao=${idAtribuicaoTarefa}`
      );
      invalidarCacheTarefas();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
      throw error;
    }
  };

  return {
    tarefas,
    loading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    buscarTarefas,
    cadastrarTarefa,
    editarTarefa,
    deletarTarefa,
    concluirTarefa,
    formatarDataExibicao,
  };
};
