import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/AuthService";

type MembroEquipeEtapaAPI = {
  id: string;
  funcionarioDTO: {
    id: string;
    nomeCompleto: string;
    qualificacaoFuncionario: string;
  };
  inicioParticipacao: string | null;
  terminoParticipacao: string | null;
};

export type MembroEquipeEtapa = MembroEquipeEtapaAPI;

type PaginacaoResponse = {
  content: MembroEquipeEtapaAPI[];
  totalPages: number;
};

export const useEquipeEtapa = (idEtapa: string) => {
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipeEtapaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const buscarEquipeEtapa = useCallback(async () => {
    if (!idEtapa) return;

    setLoading(true);
    try {
      const response = await authApi.get<PaginacaoResponse>(`/membro-equipe-etapa/listar-todos-por-etapa/${idEtapa}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      setMembrosEquipe(response.data.content);
      setTotalPaginas(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar equipe da etapa:", error);
    } finally {
      setLoading(false);
    }
  }, [idEtapa, paginaAtual]);

  const deletarMembroEquipe = useCallback(async (idMembro: string) => {
    try {
      await authApi.delete(`/membro-equipe-etapa/${idMembro}`)
    } catch (erro){
      console.error(
        "Erro ao tentar deletar membro da equipe.\n" +
        "LOCAL: Função hook deletarMembroEquipe. (hook: useEquipeEtapa)\n" +
        "ERRO:\n",
        erro
      );
    }
  }, [])

  useEffect(() => {
    buscarEquipeEtapa();
  }, [buscarEquipeEtapa, idEtapa, paginaAtual]);

  return { 
    membrosEquipe, 
    loading, 
    paginaAtual, 
    setPaginaAtual, 
    totalPaginas, 
    buscarEquipeEtapa,
    deletarMembroEquipe
  };
};
