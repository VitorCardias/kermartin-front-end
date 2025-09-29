import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/AuthService";

type MembroEquipeTarefaAPI = {
  id: string;
  funcionarioDTO: {
    id: string;
    nomeCompleto: string;
    qualificacaoFuncionario: string;
  };
  inicioParticipacao: string | null;
  terminoParticipacao: string | null;
};

export type MembroEquipeTarefa = MembroEquipeTarefaAPI;

type PaginacaoResponse = {
  content: MembroEquipeTarefaAPI[];
  totalPages: number;
};

export const useEquipeTarefa = (idTarefa: string) => {
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipeTarefaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const buscarEquipeTarefa = useCallback(async () => {
    if (!idTarefa) return;

    setLoading(true);
    try {
      const response = await authApi.get<PaginacaoResponse>(`/membro-equipe-tarefa/listar-todos-por-tarefa/${idTarefa}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setMembrosEquipe(response.data.content);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar equipe da tarefa:", error);
    } finally {
      setLoading(false);
    }
  }, [idTarefa, paginaAtual]);

  const deletarMembroEquipe = useCallback(async (idMembro: string) => {
    try {
      await authApi.delete(`/membro-equipe-tarefa/${idMembro}`)
    } catch (erro) {
      console.error(
        "Erro ao tentar deletar membro da equipe.\n" +
        "LOCAL: Função hook deletarMembroEquipe. (hook: useEquipeTarefa)\n" +
        "ERRO:\n",
        erro
      );
    }
  }, [])

  useEffect(() => {
    buscarEquipeTarefa();
  }, [buscarEquipeTarefa, idTarefa, paginaAtual]);

  return { 
    membrosEquipe, 
    loading, 
    paginaAtual, 
    setPaginaAtual, 
    totalPaginas, 
    buscarEquipeTarefa,
    deletarMembroEquipe 
  };
};
