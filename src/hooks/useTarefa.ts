import { useState } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";

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

type TarefaContexto = "etapa" | "demanda" | "funcionario";

export const useTarefa = () => {
  const perfil = usePerfil();
  const [tarefas, setTarefas] = useState<TarefaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  // Função auxiliar para formatar data para exibição
  const formatarDataExibicao = (dataString: string | null | undefined): string => {
    if (!dataString) return "Sem data";
    
    try {
      const date = new Date(dataString);
      const dia = String(date.getDate()).padStart(2, "0");
      const mes = String(date.getMonth() + 1).padStart(2, "0");
      const ano = date.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch {
      return "Data inválida";
    }
  };

  // Buscar tarefas por contexto (etapa, demanda ou funcionário)
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

  // Cadastrar tarefa
  const cadastrarTarefa = async (novaTarefa: CreateTarefaPayload): Promise<void> => {
    try {
      await authApi.post("/tarefa-etapa", {
        ...novaTarefa,
        criador: { id: perfil?.id },
        porcentagemConclusao: 0,
      });
    } catch (error) {
      console.error("Erro ao cadastrar tarefa:", error);
      throw error;
    }
  };

  // Editar tarefa
  const editarTarefa = async (
    idTarefa: string,
    tarefaEditada: Omit<TarefaAPI, "id" | "criador">
  ): Promise<void> => {
    try {
      await authApi.put("/tarefa-etapa", {
        id: idTarefa,
        ...tarefaEditada,
      });
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      throw error;
    }
  };

  // Deletar tarefa
  const deletarTarefa = async (idTarefa: string): Promise<void> => {
    try {
      await authApi.delete(`/tarefa-etapa/${idTarefa}`);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw error;
    }
  };

  // Concluir tarefa (para o contexto de funcionário)
  const concluirTarefa = async (idAtribuicaoTarefa: string): Promise<void> => {
    try {
      await authApi.patch(
        `/membro-equipe-tarefa/concluir-tarefa?idAtribuicao=${idAtribuicaoTarefa}`
      );
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