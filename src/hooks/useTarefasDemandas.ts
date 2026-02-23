import { useState, useEffect } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil";

export type TarefaDemandaAPI = {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  porcentagemConclusao: number;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  // Opcionais agora, pois depende do tipo da tarefa
  etapaDemandaDTO?: { id: string, titulo: string } | null;
  demandaDTO?: { id: string, titulo: string } | null;
  criador: { id: string };
};

export type CreateTarefaDemandaAPI = {
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  etapaDemandaDTO?: { id: string } | null;
  demandaDTO?: { id: string } | null;
};

type PaginacaoResponse = {
  content: TarefaDemandaAPI[];
  totalPages: number;
};

export const useTarefasDemanda = (idDemanda: string) => {
  const perfil = usePerfil();
  const [tarefas, setTarefas] = useState<TarefaDemandaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const buscarTarefas = async () => {
    if (!idDemanda) return;

    setLoading(true);
    try {
      // AJUSTE PARA A SUA NOVA ROTA DO BACKEND
      const response = await authApi.get<PaginacaoResponse>(`/tarefa-etapa/demanda/${idDemanda}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setTarefas(response.data.content);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar tarefas da demanda:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cadastrar Tarefa Avulsa (direto na Demanda)
  const cadastrarTarefaAvulsa = async (novaTarefa: CreateTarefaDemandaAPI) => {
    try {
      await authApi.post("/tarefa-etapa", {
        ...novaTarefa,
        demandaDTO: { id: idDemanda },
        criador: { id: perfil?.id },
        porcentagemConclusao: 0
      });
      await buscarTarefas();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa avulsa:", error);
      throw error;
    }
  };

  // Editar Tarefa (Serve tanto para avulsa quanto para etapa)
  const editarTarefa = async (idTarefa: string, tarefaEditada: Omit<TarefaDemandaAPI, "id" | "criador">) => {
    try {
      // Supondo que sua rota de PUT seja a mesma do POST ou receba o ID na URL
      await authApi.put(`/tarefa-etapa`, {
        id: idTarefa,
        ...tarefaEditada,
      });
      await buscarTarefas(); // Recarrega a lista após editar
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      throw error;
    }
  };

  const deletarTarefa = async (idTarefa: string) => {
    try {
      await authApi.delete(`/tarefa-etapa/${idTarefa}`);
      await buscarTarefas();
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw error;
    }
  };

  useEffect(() => {
    buscarTarefas();
  }, [idDemanda, paginaAtual]);

  return {
    tarefas,
    loading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    buscarTarefas,
    cadastrarTarefaAvulsa,
    editarTarefa,
    deletarTarefa
  };
};