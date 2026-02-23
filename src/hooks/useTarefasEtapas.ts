import { useState, useEffect } from "react";
import { authApi } from "../api/AuthService";
import { usePerfil } from "./usePerfil"; // Importe o hook usePerfil

export type TarefaAPI = {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  porcentagemConclusao: number;
  inicioPrazo: string | null;
  conclusaoPrazo: string | null;
  etapaDemandaDTO: { id: string };
  criador: { id: string };
};

type PaginacaoResponse = {
  content: TarefaAPI[];
  totalPages: number;
};

type NovaTarefaPayload = Omit<TarefaAPI, "id" | "criador" | "porcentagemConclusao"> & {
  etapaDemandaDTO: { id: string };
  porcentagemConclusao: number;
};

export type TarefaEtapaDemanda = TarefaAPI;

export const useTarefasEtapas = (idEtapa: string) => {
  const perfil = usePerfil(); // Utilize o hook usePerfil
  const [tarefas, setTarefas] = useState<TarefaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const buscarTarefas = async () => {
    if (!idEtapa) return;

    setLoading(true);
    try {
      const response = await authApi.get<PaginacaoResponse>(`/tarefa-etapa/listar-por-etapa/${idEtapa}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setTarefas(response.data.content);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar tarefas da etapa:", error);
    } finally {
      setLoading(false);
    }
  };

  const cadastrarTarefa = async (novaTarefa: Omit<NovaTarefaPayload, "porcentagemConclusao">) => {
    try {
      await authApi.post("/tarefa-etapa", {
        ...novaTarefa,
        criador: { id: perfil?.id }, // Utilize perfil?.id para obter o ID do usuário
        porcentagemConclusao: 0
      });
      await buscarTarefas();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa:", error);
      throw error;
    }
  };

  const deletarTarefa = async (idTarefa: string) => {
    try {
      await authApi.delete(`/tarefa-etapa/${idTarefa}`)
      await buscarTarefas();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa:", error);
      throw error;
    }
  };

  useEffect(() => {
    buscarTarefas();
  }, [idEtapa, paginaAtual]);

  return { 
    tarefas, 
    loading, 
    paginaAtual, 
    setPaginaAtual, 
    totalPaginas, 
    buscarTarefas, 
    cadastrarTarefa,
    deletarTarefa
  };
};